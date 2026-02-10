from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import requests
from twilio.rest import Client


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# NocoDB is the primary storage. MongoDB connection logic removed.
logger = logging.getLogger("uvicorn")

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

import traceback
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )


# Define Models
# Define Models
class OrderItem(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float
    image: str = None

class OrderCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    customer_name: str
    customer_email: str
    phone: str
    address: str
    products: List[OrderItem]
    total_amount: float
    payment_method: str
    status: str = "Pending"
    email_sent: bool = False

class Order(OrderCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str = Field(default_factory=lambda: f"ORD-{uuid.uuid4().hex[:8].upper()}")
    admin_token: str = Field(default_factory=lambda: uuid.uuid4().hex)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def save_to_nocodb(order: Order):
    """
    Saves the order to NocoDB.
    """
    try:
        token = os.environ.get("NOCODB_API_TOKEN")
        table_id = os.environ.get("NOCODB_TABLE_ID")
        view_id = os.environ.get("NOCODB_VIEW_ID", "")
        
        if not token or not table_id:
            print("Skipping NocoDB save: Credentials not found.")
            return False

        url = f"https://app.nocodb.com/api/v2/tables/{table_id}/records"
        
        headers = {
            "xc-token": token,
            "Content-Type": "application/json"
        }
        
        # Construct the payload based on order object
        # User requested products to be a JSON object
        products_json = [p.model_dump() for p in order.products]
        
        # Map payment method to NocoDB expected values
        nocodb_payment_method = order.payment_method
        if nocodb_payment_method in ['qr_code', 'upi']:
            nocodb_payment_method = 'QR_Code'
        elif nocodb_payment_method == 'cod':
            nocodb_payment_method = 'COD'
            
        data = {
            "order_id": order.order_id,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "phone": order.phone,
            "address": order.address,
            "total_amount": order.total_amount,
            "payment_method": nocodb_payment_method,
            "products": products_json,  # Sending as JSON object/array
            "timestamp": order.timestamp.isoformat(),
            "status": order.status,
            "email_sent": order.email_sent,
            "admin_token": order.admin_token
        }

        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code in [200, 201]:
            print(f"Order saved to NocoDB: {order.order_id}")
            return True
        else:
            print(f"Failed to save to NocoDB: {response.status_code} - {response.text}")
            logger.error(f"Failed to save to NocoDB: {response.text}")
            return False

    except Exception as e:
        print(f"Error saving to NocoDB: {e}")
        logger.error(f"Error saving to NocoDB: {e}")
        return False

def update_nocodb_status(order_id: str, status: str):
    """
    Updates the order status in NocoDB.
    """
    import time
    import urllib.parse
    # Small sleep to ensure NocoDB has finished processing the initial record creation
    time.sleep(2)
    
    try:
        token = os.environ.get("NOCODB_API_TOKEN")
        table_id = os.environ.get("NOCODB_TABLE_ID")
        
        if not token or not table_id:
            print("NocoDB update skipped: missing credentials.")
            return False

        print(f"Searching NocoDB for Order ID: {order_id.strip()}")
        # Primary search (unquoted as verified)
        unquoted_where = f"(order_id,eq,{order_id.strip()})"
        url_find = f"https://app.nocodb.com/api/v2/tables/{table_id}/records?where={urllib.parse.quote(unquoted_where)}"
        
        headers = {"xc-token": token}
        response_find = requests.get(url_find, headers=headers)
        
        # Fallback search (quoted) just in case
        if response_find.status_code != 200 or not response_find.json().get('list'):
            quoted_where = f"(order_id,eq,'{order_id.strip()}')"
            url_find_quoted = f"https://app.nocodb.com/api/v2/tables/{table_id}/records?where={urllib.parse.quote(quoted_where)}"
            response_find = requests.get(url_find_quoted, headers=headers)

        if response_find.status_code == 200:
            records = response_find.json().get('list', [])
            if not records:
                print(f"No record found in NocoDB for Order ID: {order_id}")
                return False
            
            record_id = records[0].get('Id') or records[0].get('id')
            print(f"Found NocoDB Record ID: {record_id}")
            
            # Now update the status using direct row ID URL (more reliable for some NocoDB versions)
            url_update_id = f"https://app.nocodb.com/api/v2/tables/{table_id}/records/{record_id}"
            data = {"status": status}
            
            print(f"Patching NocoDB record {record_id} via direct URL...")
            response_patch = requests.patch(url_update_id, headers=headers, json=data)
            
            if response_patch.status_code not in [200, 201, 204]:
                # Fallback to batch update URL if direct fails
                print("Direct patch failed, trying batch update URL...")
                url_update_batch = f"https://app.nocodb.com/api/v2/tables/{table_id}/records"
                data_batch = {"Id": record_id, "id": record_id, "status": status}
                response_patch = requests.patch(url_update_batch, headers=headers, json=data_batch)
            
            if response_patch.status_code in [200, 201, 204]:
                print(f"Successfully updated NocoDB status for {order_id} to: {status}")
                return True
            else:
                print(f"Failed to update status in NocoDB: {response_patch.status_code} - {response_patch.text}")
                return False
        else:
            print(f"NocoDB find failed: {response_find.status_code} - {response_find.text}")
            return False
            
    except Exception as e:
        print(f"Error updating NocoDB: {e}")
        logger.error(f"Error updating NocoDB: {e}")
    return False

@api_router.get("/orders", response_model=List[Order])
async def list_orders():
    token_env = os.environ.get("NOCODB_API_TOKEN")
    table_id_env = os.environ.get("NOCODB_TABLE_ID")
    
    if not token_env or not table_id_env:
        raise HTTPException(status_code=500, detail="NocoDB credentials missing")
        
    url = f"https://app.nocodb.com/api/v2/tables/{table_id_env}/records?limit=100&sort=-CreatedAt"
    headers = {"xc-token": token_env}
    
    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        recs = res.json().get('list', [])
        import json
        for doc in recs:
            # Map NocoDB fields to Order model
            if "Id" in doc and "id" not in doc:
                doc["id"] = str(doc["Id"])
            if "CreatedAt" in doc and "timestamp" not in doc:
                doc["timestamp"] = doc["CreatedAt"]
            
            # Handle products
            products_data = doc.get('products')
            if isinstance(products_data, str):
                try:
                    doc['products'] = json.loads(products_data)
                except:
                    doc['products'] = []
            elif not isinstance(products_data, list):
                doc['products'] = []
                
            # Filter payment_method
            pm = doc.get('payment_method')
            if pm == 'QR_Code':
                doc['payment_method'] = 'qr_code'
            elif pm == 'COD':
                doc['payment_method'] = 'cod'
            
            # Ensure email_sent is a boolean
            doc['email_sent'] = bool(doc.get('email_sent'))
        
        return recs
            
    raise HTTPException(status_code=500, detail="Failed to fetch orders from NocoDB")

@api_router.patch("/orders/{order_id}/status")
async def update_status(order_id: str, status_update: dict):
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Missing status")
        
    success = update_nocodb_status(order_id, new_status)
    if success:
        return {"status": "success", "message": f"Order {order_id} updated to {new_status}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update order status")

@api_router.post("/orders/bulk-status")
async def bulk_update_status(update_data: dict):
    order_ids = update_data.get("order_ids", [])
    new_status = update_data.get("status")
    
    if not order_ids or not new_status:
        raise HTTPException(status_code=400, detail="Missing order_ids or status")
    
    results = {"success": [], "failed": []}
    for oid in order_ids:
        if update_nocodb_status(oid, new_status):
            results["success"].append(oid)
        else:
            results["failed"].append(oid)
            
    return {
        "status": "partial_success" if results["failed"] else "success",
        "message": f"Updated {len(results['success'])} orders",
        "results": results
    }

def send_twilio_whatsapp(to_number: str, body: str = None, content_sid: str = None, content_variables: str = None):
    """
    Sends a WhatsApp message using Twilio.
    """
    try:
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        from_number = os.environ.get("TWILIO_WHATSAPP_NUMBER")
        
        if not all([account_sid, auth_token, from_number]):
            print("Skipping WhatsApp: Twilio credentials missing.")
            return

        client = Client(account_sid, auth_token)
        
        params = {
            "from_": f"whatsapp:{from_number}",
            "to": f"whatsapp:{to_number}"
        }
        
        if content_sid:
            params["content_sid"] = content_sid
            if content_variables:
                params["content_variables"] = content_variables
        else:
            params["body"] = body

        message = client.messages.create(**params)
        print(f"WhatsApp message sent: {message.sid}")
        return message.sid
    except Exception as e:
        error_msg = f"CRITICAL: Failed to send WhatsApp message: {str(e)}"
        print(error_msg)
        logger.error(error_msg)
        return None

def notify_admin_of_order(order: Order):
    """
    Formates and sends a WhatsApp notification to the admin.
    """
    admin_phone = os.environ.get("ADMIN_WHATSAPP_NUMBER")
    if not admin_phone:
        return

    products_list = "\n".join([f"- {p.name} (x{p.quantity}): ₹{p.price * p.quantity}" for p in order.products])
    
    message_body = (
        f"*New Order from Swaadanna!* 🌿\n\n"
        f"*Order ID:* {order.order_id}\n\n"
        f"*Customer Details:*\n"
        f"Name: {order.customer_name}\n"
        f"Phone: {order.phone}\n"
        f"Address: {order.address}\n\n"
        f"*Order Summary:*\n{products_list}\n\n"
        f"*Total Amount:* ₹{order.total_amount}"
    )
    
    print(f"DEBUG: Attempting to notify admin {admin_phone} for Order {order.order_id}")
    sid = send_twilio_whatsapp(admin_phone, body=message_body)
    if sid:
        print(f"DEBUG: WhatsApp SID generated: {sid}")
    else:
        print(f"DEBUG: WhatsApp failed for Order {order.order_id}")

def update_nocodb_email_status(order_id: str, email_sent: bool):
    """
    Updates the email_sent flag in NocoDB to track delivery.
    """
    try:
        token = os.environ.get("NOCODB_API_TOKEN")
        table_id = os.environ.get("NOCODB_TABLE_ID")
        
        if not token or not table_id:
            return False

        # Find record ID by order_id
        import urllib.parse
        q = urllib.parse.quote(f"(order_id,eq,{order_id})")
        url_find = f"https://app.nocodb.com/api/v2/tables/{table_id}/records?where={q}"
        headers = {"xc-token": token}
        
        response_find = requests.get(url_find, headers=headers)
        if response_find.status_code == 200:
            recs = response_find.json().get('list', [])
            if not recs:
                return False
            
            record_id = recs[0].get('Id') or recs[0].get('id')
            
            # Patch the record
            url_patch = f"https://app.nocodb.com/api/v2/tables/{table_id}/records"
            data = {"Id": record_id, "email_sent": email_sent}
            requests.patch(url_patch, headers=headers, json=data)
            return True
            
    except Exception as e:
        print(f"Error updating email status: {e}")
    return False

def send_order_confirmation_email(order: Order):
    """
    Unified utility to send order confirmation using a single SMTP connection.
    """
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com').strip()
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_username = os.environ.get('SMTP_USERNAME', '').strip()
    smtp_password = os.environ.get('SMTP_PASSWORD', '').strip()
    admin_email = os.environ.get('ADMIN_EMAIL', 'swaadanna01@gmail.com').strip()

    if not all([smtp_username, smtp_password]):
        print("❌ [EMAIL] SMTP credentials missing.")
        return

    print(f"🚀 [EMAIL] Starting for {order.order_id}")

    try:
        # Create connection once
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=15)
        server.starttls()
        server.login(smtp_username, smtp_password)

        # 1. CUSTOMER EMAIL
        cust_msg = MIMEMultipart()
        cust_msg['From'] = f"Swaadanna Himalayas <{smtp_username}>"
        cust_msg['To'] = order.customer_email
        cust_msg['Subject'] = f"Order Confirmed: {order.order_id} – Swaadanna Himalayas"
        
        product_lines = "\n".join([f"• {p.name} (x{p.quantity}) - ₹{p.price * p.quantity}" for p in order.products])
        order_date = order.timestamp.strftime("%d %b %Y")
        
        body = f"""
Hello {order.customer_name},

Thank you for placing your order with Swaadanna 🌿
We’re happy to let you know that your order has been successfully placed.

---

### 🧾 Order Details

Order ID: {order.order_id}
Order Date: {order_date}

Items Ordered:
{product_lines}

Total Amount: ₹{order.total_amount}

---

### 💬 Payment & Confirmation

Our team will contact you on WhatsApp shortly with payment options.
Once the payment is verified, your order will be confirmed and processed.

⏱️ *You should receive the WhatsApp message within 1–3 hours.*

---

### 🚚 Delivery Information

Shipping Address:
{order.address}

Expected Delivery:
4–7 business days after payment confirmation.

---

### 📞 Need Help?

If you do not receive a WhatsApp message within 3 hours, feel free to contact us:

📞 +91 83060 94431
📧 swaadanna01@gmail.com

Thank you for choosing Swaadanna.
We look forward to serving you again!

Warm regards,
Team Swaadanna
🌐 www.swaadanna.shop 
"""
        cust_msg.attach(MIMEText(body, 'plain'))
        
        server.send_message(cust_msg)
        print(f"✅ [EMAIL] Sent to Customer: {order.customer_email}")
        update_nocodb_email_status(order.order_id, True)

        # 2. ADMIN EMAIL
        admin_msg = MIMEMultipart()
        admin_msg['From'] = f"Swaadanna Alerts <{smtp_username}>"
        admin_msg['To'] = admin_email
        admin_msg['Subject'] = f"NEW ORDER: {order.order_id}"
        admin_body = f"New order from {order.customer_name}.\nTotal: ₹{order.total_amount}\nCheck dashboard."
        admin_msg.attach(MIMEText(admin_body, 'plain'))
        
        server.send_message(admin_msg)
        print(f"✅ [EMAIL] Sent to Admin: {admin_email}")

        server.quit()

    except Exception as e:
        print(f"❌ [EMAIL] CRITICAL FAILURE: {e}")
        update_nocodb_email_status(order.order_id, False)


@api_router.get("/test-email")
async def test_email_route(email: str = "swaadanna01@gmail.com"):
    """
    Triggers a real test email to verify logic in uvicorn environment.
    """
    dummy_order = Order(
        customer_name="Tester",
        customer_email=email,
        phone="00000000",
        address="Test",
        products=[],
        total_amount=0,
        payment_method="test",
        order_id="TEST-001"
    )
    send_order_confirmation_email(dummy_order)
    return {"status": "triggered", "recipient": email, "check": "your terminal logs"}

from fastapi import BackgroundTasks

@api_router.post("/orders", response_model=Order)
async def create_order(input: OrderCreate, background_tasks: BackgroundTasks):
    order_dict = input.model_dump()
    order_obj = Order(**order_dict)
    
    # Save to NocoDB (Primary and only storage now)
    background_tasks.add_task(save_to_nocodb, order_obj)
    
    # Send email in background using FastAPI BackgroundTasks
    background_tasks.add_task(send_order_confirmation_email, order_obj)
    
    # Notify admin via WhatsApp
    background_tasks.add_task(notify_admin_of_order, order_obj)
    
    return order_obj


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    token_env = os.environ.get("NOCODB_API_TOKEN")
    table_id_env = os.environ.get("NOCODB_TABLE_ID")
    
    if not token_env or not table_id_env:
        raise HTTPException(status_code=500, detail="NocoDB credentials missing")
        
    import urllib.parse
    import json
    q = urllib.parse.quote(f"(order_id,eq,{order_id.strip()})")
    url = f"https://app.nocodb.com/api/v2/tables/{table_id_env}/records?where={q}"
    headers = {"xc-token": token_env}
    
    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        recs = res.json().get('list', [])
        if recs:
            doc = recs[0]
            # Map NocoDB fields to Order model
            if "Id" in doc and "id" not in doc:
                doc["id"] = str(doc["Id"])
            if "CreatedAt" in doc and "timestamp" not in doc:
                doc["timestamp"] = doc["CreatedAt"]
            
            # Handle products
            products_data = doc.get('products')
            if isinstance(products_data, str):
                try:
                    doc['products'] = json.loads(products_data)
                except:
                    doc['products'] = []
            elif not isinstance(products_data, list):
                doc['products'] = []
                
            # Filter payment_method
            pm = doc.get('payment_method')
            if pm == 'QR_Code':
                doc['payment_method'] = 'qr_code'
            elif pm == 'COD':
                doc['payment_method'] = 'cod'
                
            # Ensure email_sent is a boolean (handle None/null from NocoDB)
            doc['email_sent'] = bool(doc.get('email_sent'))
                
            return doc
            
    raise HTTPException(status_code=404, detail="Order not found")

@api_router.get("/debug/whatsapp")
async def debug_whatsapp():
    """
    Manually triggers a test WhatsApp message to the admin.
    """
    admin_phone = os.environ.get("ADMIN_WHATSAPP_NUMBER")
    if not admin_phone:
        return {"status": "error", "message": "ADMIN_WHATSAPP_NUMBER not set in .env"}
    
    sid = send_twilio_whatsapp(
        admin_phone, 
        body=f"🧪 *Swaadanna Debug Message*\nTriggered at {datetime.now().strftime('%H:%M:%S')}.\nIf you see this, the server can communicate with Twilio!"
    )
    
    if sid:
        return {"status": "success", "message": f"Message sent! SID: {sid}", "to": admin_phone}
    else:
        return {"status": "error", "message": "Failed to send message. Check server logs."}

# Include the router in the main app
app.include_router(api_router)

# Configure CORS
raw_origins = os.environ.get('CORS_ORIGINS', '*')
if raw_origins == '*':
    origins = ['*']
else:
    origins = [o.strip() for o in raw_origins.split(',') if o.strip()]

print(f"📡 CORS: Allowing origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=(origins != ['*']), 
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Serving React app logic...

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Serve React App
# Mount the static files from the build directory
# We go up one level from 'backend' to root, then into 'frontend/build'
# Since WORKDIR in Docker is /app/backend, and we copied frontend/build to /app/frontend/build
# The relative path from backend/server.py (if running in backend dir) to ../frontend/build
build_dir = Path(__file__).parent.parent / "frontend" / "build"

if build_dir.exists():
    app.mount("/static", StaticFiles(directory=build_dir / "static"), name="static")
    
    # Catch-all route to serve index.html for client-side routing
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Allow API calls to pass through (though they should be caught by prefix above)
        if full_path.startswith("api"):
             return {"error": "Not Found"}
        
        # Check if a specific file is requested (e.g. manifest.json, favicon.ico)
        file_path = build_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
            
        # Otherwise return index.html
        return FileResponse(build_dir / "index.html")