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


# Define Models
# Define Models
class OrderItem(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float

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
        print(f"Failed to send WhatsApp message: {e}")
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
        f"*Total Amount:* ₹{order.total_amount}\n"
        f"*Payment Method:* {order.payment_method}"
    )
    
    send_twilio_whatsapp(admin_phone, body=message_body)




def send_order_email(order: Order):
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_username = os.environ.get('SMTP_USERNAME')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    admin_email = os.environ.get('ADMIN_EMAIL')

    if not all([smtp_username, smtp_password, admin_email]):
        print("Skipping email: SMTP credentials not provided.")
        return

    msg = MIMEMultipart()
    msg['From'] = smtp_username
    msg['To'] = admin_email
    msg['Subject'] = f"New Order Received: {order.order_id}"

    product_lines = "\n".join([f"- {p.name} (x{p.quantity}): ₹{p.price * p.quantity}" for p in order.products])
    
    body = f"""
    New Order Received!
    
    Order ID: {order.order_id}
    Time: {order.timestamp}
    
    Customer Details:
    Name: {order.customer_name}
    Email: {order.customer_email}
    Phone: {order.phone}
    Address: {order.address}
    
    Order Summary:
    {product_lines}
    
    Total Amount: ₹{order.total_amount}
    Payment Method: {order.payment_method}
    """
    
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        print(f"Order email sent for {order.order_id}")
    except Exception as e:
        print(f"Failed to send email: {e}")

from fastapi import BackgroundTasks

@api_router.post("/orders", response_model=Order)
async def create_order(input: OrderCreate, background_tasks: BackgroundTasks):
    order_dict = input.model_dump()
    order_obj = Order(**order_dict)
    
    # Save to NocoDB (Primary and only storage now)
    background_tasks.add_task(save_to_nocodb, order_obj)
    
    # Send email in background using FastAPI BackgroundTasks
    background_tasks.add_task(send_order_email, order_obj)
    
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
                
            return doc
            
    raise HTTPException(status_code=404, detail="Order not found")

# Include the router in the main app
app.include_router(api_router)

# Configure CORS
origins = os.environ.get('CORS_ORIGINS', '*').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=(origins != ['*']), # Disable credentials if allowing all origins to avoid browser errors
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