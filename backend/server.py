from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import requests


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = None
db = None

if mongo_url:
    try:
        # Create a new client and connect to the server
        # tlsAllowInvalidCertificates=True is needed to bypass SSL handshake errors on some macOS environments
        # NocoDB is now the primary storage
        client = AsyncIOMotorClient(mongo_url, tlsAllowInvalidCertificates=True)
        # Default to 'test' if DB_NAME not set
        db_name = os.environ.get('DB_NAME', 'test')
        db = client[db_name]
        logger = logging.getLogger("uvicorn")
        logger.info(f"Connected to MongoDB: {db_name}")
    except Exception as e:
        logger = logging.getLogger("uvicorn")
        logger.error(f"Failed to connect to MongoDB: {e}")
else:
    logger = logging.getLogger("uvicorn")
    logger.warning("MONGO_URL not found. Running without database connection.")

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class OrderItem(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    phone: str
    address: str
    products: List[OrderItem]
    total_amount: float
    payment_method: str

class Order(OrderCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str = Field(default_factory=lambda: f"ORD-{uuid.uuid4().hex[:8].upper()}")
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
            "timestamp": order.timestamp.isoformat()
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
    
    doc = order_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    # Save to NocoDB (Primary storage now)
    background_tasks.add_task(save_to_nocodb, order_obj)
    
    # Optional: Still try to save to MongoDB if configured, but don't error out
    if db is not None:
        try:
            await db.orders.insert_one(doc)
        except Exception as e:
            print(f"MongoDB save failed (non-critical): {e}")
    
    # Send email in background using FastAPI BackgroundTasks
    background_tasks.add_task(send_order_email, order_obj)
    
    return order_obj

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

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