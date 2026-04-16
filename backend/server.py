from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64
import cloudinary
import cloudinary.uploader


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
# Intentamos buscar MONGODB_URI (el que pusimos en Render) o MONGO_URL
mongo_url = os.environ.get('MONGODB_URI') or os.environ.get('MONGO_URL')

if not mongo_url:
    # Si no hay ninguna variable (caso local), usamos localhost por defecto
    mongo_url = "mongodb://localhost:27017"

client = AsyncIOMotorClient(mongo_url)

# Para el nombre de la base de datos, buscamos DB_NAME, 
# y si no existe, le ponemos uno por defecto como 'floristeria_db'
db_name = os.environ.get('DB_NAME', 'floristeria_db')
db = client[db_name]
# Cloudinary configuration
cloudinary_url = os.environ.get('CLOUDINARY_URL', '')
if cloudinary_url:
    cloudinary.config(cloudinary_url=cloudinary_url)

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'floristeria-atelier-fleurs-secret-2026')
JWT_ALGORITHM = 'HS256'

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ===== MODELS =====

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    email: str

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    slug: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    subcategory: Optional[str] = None
    image_url: str
    stock: int = 100
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    subcategory: Optional[str] = None
    image_url: str
    stock: int = 100

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    items: List[dict]
    total: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    items: List[dict]
    total: float

class Complaint(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    document_type: str
    document_number: str
    phone: str
    address: str
    email: EmailStr
    request_type: str
    detail: str
    requested_action: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ComplaintCreate(BaseModel):
    full_name: str
    document_type: str
    document_number: str
    phone: str
    address: str
    email: EmailStr
    request_type: str
    detail: str
    requested_action: str

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_type: str  # 'percentage' or 'fixed'
    discount_value: float
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CouponCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    active: bool = True

class CouponValidate(BaseModel):
    code: str
    total: float

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "global_settings"
    coupons_enabled: bool = False
    hero_banner_url: str = "https://images.unsplash.com/photo-1587316830182-59ca6817ce72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85"


# ===== AUTH HELPERS =====

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(email: str) -> str:
    payload = {
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ===== ROUTES =====

@api_router.get("/")
async def root():
    return {"message": "Floristería Atelier Fleurs API"}


# ----- ADMIN AUTH -----

@api_router.post("/admin/register")
async def register_admin(admin: AdminLogin):
    existing = await db.admins.find_one({"email": admin.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    admin_obj = AdminUser(
        email=admin.email,
        password_hash=hash_password(admin.password)
    )
    
    doc = admin_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.admins.insert_one(doc)
    
    return {"message": "Admin registered successfully"}

@api_router.post("/admin/login", response_model=TokenResponse)
async def login_admin(admin: AdminLogin):
    user = await db.admins.find_one({"email": admin.email}, {"_id": 0})
    if not user or not verify_password(admin.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(admin.email)
    return TokenResponse(token=token, email=admin.email)

@api_router.get("/admin/verify")
async def verify_admin(token: str):
    payload = verify_token(token)
    return {"email": payload['email'], "valid": True}


# ----- CATEGORIES -----

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat['created_at'], str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate):
    cat_obj = Category(**category.model_dump())
    doc = cat_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return cat_obj

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category: CategoryCreate):
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": category.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Category(**updated)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}


# ----- PRODUCTS -----

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {} if not category else {"category": category}
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod['created_at'], str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product['created_at'], str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    prod_obj = Product(**product.model_dump())
    doc = prod_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return prod_obj

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductCreate):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Product(**updated)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}


# ----- ORDERS -----

@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    order_obj = Order(**order.model_dump())
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    return order_obj

@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders


# ----- COMPLAINTS -----

@api_router.post("/complaints", response_model=Complaint)
async def create_complaint(complaint: ComplaintCreate):
    complaint_obj = Complaint(**complaint.model_dump())
    doc = complaint_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.complaints.insert_one(doc)
    return complaint_obj

@api_router.get("/complaints", response_model=List[Complaint])
async def get_complaints():
    complaints = await db.complaints.find({}, {"_id": 0}).to_list(1000)
    for complaint in complaints:
        if isinstance(complaint['created_at'], str):
            complaint['created_at'] = datetime.fromisoformat(complaint['created_at'])
    return complaints


# ----- COUPONS -----

@api_router.get("/coupons", response_model=List[Coupon])
async def get_coupons():
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(1000)
    for coupon in coupons:
        if isinstance(coupon['created_at'], str):
            coupon['created_at'] = datetime.fromisoformat(coupon['created_at'])
    return coupons

@api_router.post("/coupons", response_model=Coupon)
async def create_coupon(coupon: CouponCreate):
    existing = await db.coupons.find_one({"code": coupon.code.upper()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon_obj = Coupon(**coupon.model_dump())
    coupon_obj.code = coupon_obj.code.upper()
    doc = coupon_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.coupons.insert_one(doc)
    return coupon_obj

@api_router.put("/coupons/{coupon_id}")
async def update_coupon(coupon_id: str, coupon: CouponCreate):
    result = await db.coupons.update_one(
        {"id": coupon_id},
        {"$set": {**coupon.model_dump(), "code": coupon.code.upper()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    updated = await db.coupons.find_one({"id": coupon_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Coupon(**updated)

@api_router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str):
    result = await db.coupons.delete_one({"id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted"}

@api_router.post("/coupons/validate")
async def validate_coupon(data: CouponValidate):
    coupon = await db.coupons.find_one(
        {"code": data.code.upper(), "active": True}, 
        {"_id": 0}
    )
    if not coupon:
        raise HTTPException(status_code=404, detail="Cupón inválido o inactivo")
    
    discount_amount = 0
    if coupon['discount_type'] == 'percentage':
        discount_amount = data.total * (coupon['discount_value'] / 100)
    else:  # fixed
        discount_amount = coupon['discount_value']
    
    new_total = max(0, data.total - discount_amount)
    
    return {
        "valid": True,
        "discount_type": coupon['discount_type'],
        "discount_value": coupon['discount_value'],
        "discount_amount": discount_amount,
        "new_total": new_total
    }


# ----- SETTINGS -----

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "global_settings"}, {"_id": 0})
    if not settings:
        default_settings = {
            "id": "global_settings", 
            "coupons_enabled": False,
            "hero_banner_url": "https://images.unsplash.com/photo-1587316830182-59ca6817ce72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85"
        }
        await db.settings.insert_one(default_settings)
        return default_settings
    return settings

@api_router.put("/settings")
async def update_settings(settings: Settings):
    await db.settings.update_one(
        {"id": "global_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return settings


# ----- IMAGE UPLOAD -----

@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload image to Cloudinary and return secure URL"""
    if not cloudinary_url:
        raise HTTPException(
            status_code=503, 
            detail="Cloudinary not configured. Please set CLOUDINARY_URL environment variable."
        )
    
    try:
        # Read file content
        contents = await file.read()
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder="atelier_fleurs",
            resource_type="auto"
        )
        
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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


# Seed initial data
@app.on_event("startup")
async def seed_data():
    # Create default admin if not exists
    admin_exists = await db.admins.find_one({"email": "admin@atelierfleurs.com"})
    if not admin_exists:
        admin = AdminUser(
            email="admin@atelierfleurs.com",
            password_hash=hash_password("admin123")
        )
        doc = admin.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.admins.insert_one(doc)
        logger.info("Default admin created: admin@atelierfleurs.com / admin123")
    
    # Create categories if not exists
    cat_count = await db.categories.count_documents({})
    if cat_count == 0:
        categories = [
            {"name": "K-Pop & Temáticos", "slug": "kpop-tematicos"},
            {"name": "Ocasiones Especiales", "slug": "ocasiones-especiales"},
            {"name": "Tipos de Flor", "slug": "tipos-flor"},
            {"name": "Estilos y Presentaciones", "slug": "estilos-presentaciones"},
            {"name": "Peluches", "slug": "peluches"},
            {"name": "Plantas", "slug": "plantas"},
        ]
        for cat in categories:
            cat_obj = Category(**cat)
            doc = cat_obj.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.categories.insert_one(doc)
        logger.info("Default categories created")
