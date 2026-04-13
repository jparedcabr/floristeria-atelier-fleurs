from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT config
JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autenticado")
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token invalido")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        safe = {k: v for k, v in user.items() if k != "password_hash"}
        return safe
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalido")

# Create app and router
app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Pydantic Models ---
class LoginRequest(BaseModel):
    email: str
    password: str

class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    category: str
    subcategory: str
    image_url: str = ""
    featured: bool = False
    available: bool = True
    tags: List[str] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    image_url: Optional[str] = None
    featured: Optional[bool] = None
    available: Optional[bool] = None
    tags: Optional[List[str]] = None

class OrderItemModel(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    items: List[OrderItemModel]
    customer_name: str
    customer_phone: str
    customer_email: str = ""
    notes: str = ""
    total: float

class OrderStatusUpdate(BaseModel):
    status: str

class ComplaintCreate(BaseModel):
    name: str
    dni: str
    email: str
    phone: str
    address: str = ""
    description: str
    claim_type: str = "queja"

# --- Auth Routes ---
@api_router.post("/auth/login")
async def login(data: LoginRequest):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales invalidas")
    token = create_access_token(user["id"], user["email"])
    safe = {k: v for k, v in user.items() if k != "password_hash"}
    return {"user": safe, "token": token}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/logout")
async def logout():
    return {"message": "Sesion cerrada"}

# --- Product Routes (Public) ---
@api_router.get("/products")
async def list_products(category: Optional[str] = None, subcategory: Optional[str] = None, featured: Optional[bool] = None, search: Optional[str] = None):
    query = {"available": True}
    if category:
        query["category"] = category
    if subcategory:
        query["subcategory"] = subcategory
    if featured is not None:
        query["featured"] = featured
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

# --- Product Routes (Admin) ---
@api_router.get("/admin/products")
async def admin_list_products(request: Request):
    await get_current_user(request)
    products = await db.products.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return products

@api_router.post("/admin/products")
async def admin_create_product(data: ProductCreate, request: Request):
    await get_current_user(request)
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    created = await db.products.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, data: ProductUpdate, request: Request):
    await get_current_user(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Sin datos para actualizar")
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, request: Request):
    await get_current_user(request)
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"message": "Producto eliminado"}

# --- Order Routes ---
@api_router.post("/orders")
async def create_order(data: OrderCreate):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "pendiente"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["items"] = [item if isinstance(item, dict) else item for item in doc["items"]]
    await db.orders.insert_one(doc)
    created = await db.orders.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.get("/admin/orders")
async def admin_list_orders(request: Request):
    await get_current_user(request)
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@api_router.put("/admin/orders/{order_id}")
async def admin_update_order(order_id: str, data: OrderStatusUpdate, request: Request):
    await get_current_user(request)
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": data.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return order

# --- Complaint Routes ---
@api_router.post("/complaints")
async def create_complaint(data: ComplaintCreate):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "pendiente"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.complaints.insert_one(doc)
    created = await db.complaints.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.get("/admin/complaints")
async def admin_list_complaints(request: Request):
    await get_current_user(request)
    complaints = await db.complaints.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return complaints

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Seed Data ---
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@atelierfleurs.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email}, {"_id": 0})
    if existing is None:
        user_id = str(uuid.uuid4())
        await db.users.insert_one({
            "id": user_id, "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin", "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated: {admin_email}")

async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return
    products = [
        # K-Pop - Universo BTS
        {"name": "Ramo BTS Purple Dream", "description": "Hermoso ramo en tonos purpura inspirado en BTS con rosas y complementos.", "price": 120.00, "category": "kpop-tematicos", "subcategory": "universo-bts", "image_url": "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&h=500&fit=crop", "featured": True, "tags": ["bts", "kpop", "ramo"]},
        {"name": "Mega Ramo BTS Army", "description": "Mega ramo XXL con flores variadas en tonos BTS purple.", "price": 250.00, "category": "kpop-tematicos", "subcategory": "universo-bts", "image_url": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=500&h=500&fit=crop", "featured": True, "tags": ["bts", "kpop", "mega ramo"]},
        {"name": "Caja BTS Dynamite", "description": "Elegante caja floral con tematica BTS, incluye mensaje personalizado.", "price": 180.00, "category": "kpop-tematicos", "subcategory": "universo-bts", "image_url": "https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=500&h=500&fit=crop", "tags": ["bts", "kpop", "caja"]},
        # K-Pop - Universo Stray Kids
        {"name": "Ramo Stray Kids Neon", "description": "Ramo colorido inspirado en Stray Kids con flores vibrantes.", "price": 120.00, "category": "kpop-tematicos", "subcategory": "universo-stray-kids", "image_url": "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&h=500&fit=crop", "featured": True, "tags": ["stray kids", "kpop", "ramo"]},
        {"name": "Mega Ramo Stray Kids Maniac", "description": "Mega ramo XXL con flores en tonos vibrantes estilo Stray Kids.", "price": 250.00, "category": "kpop-tematicos", "subcategory": "universo-stray-kids", "image_url": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=500&h=500&fit=crop", "tags": ["stray kids", "kpop", "mega ramo"]},
        {"name": "Caja Stray Kids Stay", "description": "Caja floral premium con tematica Stray Kids, personalizable.", "price": 180.00, "category": "kpop-tematicos", "subcategory": "universo-stray-kids", "image_url": "https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=500&h=500&fit=crop", "tags": ["stray kids", "kpop", "caja"]},
        # K-Pop - Personajes Animados
        {"name": "Ramo Snoopy", "description": "Adorable ramo con tematica Snoopy, perfecto para fans de Peanuts.", "price": 95.00, "category": "kpop-tematicos", "subcategory": "personajes-animados", "image_url": "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&h=500&fit=crop", "tags": ["snoopy", "animado"]},
        {"name": "Ramo Stitch Tropical", "description": "Ramo tropical inspirado en Stitch con flores exoticas.", "price": 110.00, "category": "kpop-tematicos", "subcategory": "personajes-animados", "image_url": "https://images.unsplash.com/photo-1541275055241-329bbdf9a191?w=500&h=500&fit=crop", "featured": True, "tags": ["stitch", "animado"]},
        {"name": "Ramo Lotso Strawberry", "description": "Ramo rosa inspirado en Lotso con rosas y detalles decorativos.", "price": 105.00, "category": "kpop-tematicos", "subcategory": "personajes-animados", "image_url": "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=500&h=500&fit=crop", "tags": ["lotso", "animado"]},
        {"name": "Ramo Hello Kitty", "description": "Delicado ramo en tonos rosa y blanco inspirado en Hello Kitty.", "price": 100.00, "category": "kpop-tematicos", "subcategory": "personajes-animados", "image_url": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&h=500&fit=crop", "tags": ["hello kitty", "animado"]},
        {"name": "Ramo Angela Pastel", "description": "Ramo elegante con tematica Angela en tonos pastel.", "price": 98.00, "category": "kpop-tematicos", "subcategory": "personajes-animados", "image_url": "https://images.unsplash.com/photo-1613539246066-78db6ec4ff0f?w=500&h=500&fit=crop", "tags": ["angela", "animado"]},
        {"name": "Ramo Lucifer Dark Rose", "description": "Ramo dark con rosas rojas y negras inspirado en Lucifer.", "price": 115.00, "category": "kpop-tematicos", "subcategory": "personajes-animados", "image_url": "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=500&h=500&fit=crop", "tags": ["lucifer", "animado"]},
        # Ocasiones - Graduacion
        {"name": "Ramo Graduacion Elegante", "description": "Ramo especial para graduacion con flores selectas.", "price": 130.00, "category": "ocasiones-especiales", "subcategory": "graduacion", "image_url": "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&h=500&fit=crop", "featured": True, "tags": ["graduacion"]},
        {"name": "Bouquet Graduacion Premium", "description": "Bouquet premium para celebrar tu graduacion con estilo.", "price": 180.00, "category": "ocasiones-especiales", "subcategory": "graduacion", "image_url": "https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=500&h=500&fit=crop", "tags": ["graduacion", "premium"]},
        # Ocasiones - Para Hombre
        {"name": "Ramo Elegante para El", "description": "Arreglo masculino con girasoles y follaje verde.", "price": 95.00, "category": "ocasiones-especiales", "subcategory": "para-hombre", "image_url": "https://images.unsplash.com/photo-1518882054726-f1a04a8eb661?w=500&h=500&fit=crop", "tags": ["hombre", "girasoles"]},
        {"name": "Caja Floral Masculina", "description": "Caja con flores en tonos tierra y verdes, perfecta para hombre.", "price": 120.00, "category": "ocasiones-especiales", "subcategory": "para-hombre", "image_url": "https://images.unsplash.com/photo-1769990878496-c809190201b9?w=500&h=500&fit=crop", "tags": ["hombre", "caja"]},
        # Ocasiones - Romanticos
        {"name": "Ramo Romantico 50 Rosas", "description": "Impresionante ramo de 50 rosas rojas para aniversario.", "price": 280.00, "category": "ocasiones-especiales", "subcategory": "romanticos-aniversario", "image_url": "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=500&h=500&fit=crop", "featured": True, "tags": ["romantico", "rosas"]},
        {"name": "Corazon de Rosas", "description": "Arreglo en forma de corazon con rosas rojas, simbolo de amor.", "price": 220.00, "category": "ocasiones-especiales", "subcategory": "romanticos-aniversario", "image_url": "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=500&h=500&fit=crop", "tags": ["romantico", "corazon"]},
        # Ocasiones - Dia de la Madre
        {"name": "Ramo Mama Te Amo", "description": "Ramo especial para mama con mix de flores coloridas.", "price": 110.00, "category": "ocasiones-especiales", "subcategory": "dia-de-la-madre", "image_url": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&h=500&fit=crop", "featured": True, "tags": ["madre", "mama"]},
        {"name": "Arreglo Reina del Hogar", "description": "Elegante arreglo floral premium para la reina del hogar.", "price": 160.00, "category": "ocasiones-especiales", "subcategory": "dia-de-la-madre", "image_url": "https://images.unsplash.com/photo-1613539246066-78db6ec4ff0f?w=500&h=500&fit=crop", "tags": ["madre", "premium"]},
        # Ocasiones - San Valentin
        {"name": "Ramo San Valentin Classic", "description": "Ramo clasico de San Valentin con rosas rojas y baby breath.", "price": 140.00, "category": "ocasiones-especiales", "subcategory": "san-valentin", "image_url": "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=500&h=500&fit=crop", "tags": ["san valentin", "rosas"]},
        {"name": "Mega Ramo Valentin Premium", "description": "Mega ramo de 100 rosas para San Valentin con peluche.", "price": 350.00, "category": "ocasiones-especiales", "subcategory": "san-valentin", "image_url": "https://images.unsplash.com/photo-1730749387748-79e6d50a269c?w=500&h=500&fit=crop", "featured": True, "tags": ["san valentin", "mega ramo"]},
        # Ocasiones - Flores Amarillas
        {"name": "Ramo Flores Amarillas 21 Marzo", "description": "Ramo de flores amarillas para celebrar la amistad.", "price": 85.00, "category": "ocasiones-especiales", "subcategory": "flores-amarillas", "image_url": "https://images.unsplash.com/photo-1518882054726-f1a04a8eb661?w=500&h=500&fit=crop", "tags": ["amarillo", "amistad"]},
        {"name": "Girasoles de Amistad", "description": "Hermoso ramo de girasoles para tu mejor amigo/a.", "price": 75.00, "category": "ocasiones-especiales", "subcategory": "flores-amarillas", "image_url": "https://images.unsplash.com/photo-1769990878496-c809190201b9?w=500&h=500&fit=crop", "tags": ["girasoles", "amistad"]},
        # Tipos de Flor - Rosas
        {"name": "Ramo de 12 Rosas Rojas", "description": "Clasico ramo de 12 rosas rojas frescas.", "price": 65.00, "category": "tipos-de-flor", "subcategory": "rosas", "image_url": "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=500&h=500&fit=crop", "featured": True, "tags": ["rosas", "rojas"]},
        {"name": "Ramo de 24 Rosas Mix", "description": "Ramo de 24 rosas en colores variados.", "price": 120.00, "category": "tipos-de-flor", "subcategory": "rosas", "image_url": "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=500&h=500&fit=crop", "tags": ["rosas", "mix"]},
        {"name": "Rosas Rosadas Premium", "description": "Ramo de rosas rosadas de primera calidad.", "price": 85.00, "category": "tipos-de-flor", "subcategory": "rosas", "image_url": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=500&h=500&fit=crop", "tags": ["rosas", "rosadas"]},
        # Tipos de Flor - Tulipanes
        {"name": "Ramo de Tulipanes Holandeses", "description": "Elegante ramo de tulipanes importados.", "price": 95.00, "category": "tipos-de-flor", "subcategory": "tulipanes", "image_url": "https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=500&h=500&fit=crop", "featured": True, "tags": ["tulipanes"]},
        {"name": "Tulipanes Mix Colores", "description": "Ramo colorido de tulipanes en varios tonos.", "price": 110.00, "category": "tipos-de-flor", "subcategory": "tulipanes", "image_url": "https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=500&h=500&fit=crop", "tags": ["tulipanes", "mix"]},
        # Tipos de Flor - Lilium
        {"name": "Ramo de Lilium Blanco", "description": "Majestuoso ramo de lilium blancos, simbolo de pureza.", "price": 90.00, "category": "tipos-de-flor", "subcategory": "lilium", "image_url": "https://images.unsplash.com/photo-1568702846914-96b305d2ead1?w=500&h=500&fit=crop", "tags": ["lilium", "blanco"]},
        {"name": "Lilium Rosa Oriental", "description": "Hermoso ramo de lilium oriental rosado.", "price": 100.00, "category": "tipos-de-flor", "subcategory": "lilium", "image_url": "https://images.unsplash.com/photo-1568702846914-96b305d2ead1?w=500&h=500&fit=crop", "tags": ["lilium", "rosa"]},
        # Tipos de Flor - Girasoles
        {"name": "Ramo de Girasoles", "description": "Ramo alegre de girasoles frescos para iluminar tu dia.", "price": 70.00, "category": "tipos-de-flor", "subcategory": "girasoles", "image_url": "https://images.unsplash.com/photo-1518882054726-f1a04a8eb661?w=500&h=500&fit=crop", "featured": True, "tags": ["girasoles"]},
        {"name": "Mega Girasoles Sunshine", "description": "Gran ramo de girasoles con follaje decorativo.", "price": 110.00, "category": "tipos-de-flor", "subcategory": "girasoles", "image_url": "https://images.unsplash.com/photo-1769990878496-c809190201b9?w=500&h=500&fit=crop", "tags": ["girasoles", "mega"]},
        # Tipos de Flor - Gerberas
        {"name": "Ramo de Gerberas Coloridas", "description": "Alegre ramo de gerberas en colores vibrantes.", "price": 65.00, "category": "tipos-de-flor", "subcategory": "gerberas", "image_url": "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=500&h=500&fit=crop", "tags": ["gerberas"]},
        {"name": "Gerberas y Follaje", "description": "Ramo de gerberas con follaje tropical.", "price": 80.00, "category": "tipos-de-flor", "subcategory": "gerberas", "image_url": "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=500&h=500&fit=crop", "tags": ["gerberas", "tropical"]},
        # Estilos - Ramos Buchones
        {"name": "Ramo Buchon 50 Rosas", "description": "Espectacular ramo buchon con 50 rosas y envoltura premium.", "price": 200.00, "category": "estilos-presentaciones", "subcategory": "ramos-buchones", "image_url": "https://images.unsplash.com/photo-1730749387748-79e6d50a269c?w=500&h=500&fit=crop", "featured": True, "tags": ["buchon", "rosas"]},
        {"name": "Ramo Buchon 100 Rosas", "description": "Impresionante ramo buchon de 100 rosas, el mas deseado.", "price": 380.00, "category": "estilos-presentaciones", "subcategory": "ramos-buchones", "image_url": "https://images.unsplash.com/photo-1730749387748-79e6d50a269c?w=500&h=500&fit=crop", "tags": ["buchon", "premium"]},
        # Estilos - Sombrereras
        {"name": "Sombrerera de Rosas", "description": "Elegante sombrerera con rosas frescas.", "price": 150.00, "category": "estilos-presentaciones", "subcategory": "sombrereras-arreglos", "image_url": "https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=500&h=500&fit=crop", "tags": ["sombrerera", "rosas"]},
        {"name": "Arreglo Floral Ejecutivo", "description": "Arreglo floral elegante para oficina o evento.", "price": 135.00, "category": "estilos-presentaciones", "subcategory": "sombrereras-arreglos", "image_url": "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&h=500&fit=crop", "tags": ["arreglo", "ejecutivo"]},
        # Estilos - Ramos Individuales
        {"name": "Rosa Individual Premium", "description": "Una rosa individual de tallo largo con envoltura elegante.", "price": 25.00, "category": "estilos-presentaciones", "subcategory": "ramos-individuales", "image_url": "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=500&h=500&fit=crop", "tags": ["individual", "rosa"]},
        {"name": "Girasol Individual", "description": "Un girasol individual con envoltura artesanal.", "price": 20.00, "category": "estilos-presentaciones", "subcategory": "ramos-individuales", "image_url": "https://images.unsplash.com/photo-1518882054726-f1a04a8eb661?w=500&h=500&fit=crop", "tags": ["individual", "girasol"]},
        # Estilos - Rosas en Caja
        {"name": "Caja de 12 Rosas Rojas", "description": "Caja elegante con 12 rosas rojas.", "price": 140.00, "category": "estilos-presentaciones", "subcategory": "rosas-en-caja", "image_url": "https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=500&h=500&fit=crop", "featured": True, "tags": ["caja", "rosas"]},
        {"name": "Caja Luxury 24 Rosas", "description": "Caja luxury con 24 rosas y chocolates artesanales.", "price": 250.00, "category": "estilos-presentaciones", "subcategory": "rosas-en-caja", "image_url": "https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=500&h=500&fit=crop", "tags": ["caja", "luxury"]},
        # Peluches
        {"name": "Peluche Oso Gigante", "description": "Peluche de oso gigante de 1 metro, suave y adorable.", "price": 120.00, "category": "peluches", "subcategory": "peluches-grandes", "image_url": "https://images.pexels.com/photos/9119278/pexels-photo-9119278.jpeg?auto=compress&cs=tinysrgb&w=500", "featured": True, "tags": ["peluche", "oso"]},
        {"name": "Peluche Unicornio XL", "description": "Peluche de unicornio extra grande, ideal para regalar.", "price": 95.00, "category": "peluches", "subcategory": "peluches-grandes", "image_url": "https://images.pexels.com/photos/9119278/pexels-photo-9119278.jpeg?auto=compress&cs=tinysrgb&w=500", "tags": ["peluche", "unicornio"]},
        {"name": "Peluche Stitch Grande", "description": "Peluche grande de Stitch, perfecto para fans de Disney.", "price": 110.00, "category": "peluches", "subcategory": "peluches-grandes", "image_url": "https://images.pexels.com/photos/9119278/pexels-photo-9119278.jpeg?auto=compress&cs=tinysrgb&w=500", "tags": ["peluche", "stitch"]},
        # Plantas Decorativas
        {"name": "Suculenta en Maceta Artesanal", "description": "Hermosa suculenta en maceta de ceramica artesanal.", "price": 45.00, "category": "plantas-decorativas", "subcategory": "plantas-oficina", "image_url": "https://images.pexels.com/photos/8297857/pexels-photo-8297857.jpeg?auto=compress&cs=tinysrgb&w=500", "tags": ["planta", "suculenta"]},
        {"name": "Orquidea de Oficina", "description": "Elegante orquidea en maceta decorativa para oficina.", "price": 85.00, "category": "plantas-decorativas", "subcategory": "plantas-oficina", "image_url": "https://images.pexels.com/photos/8297857/pexels-photo-8297857.jpeg?auto=compress&cs=tinysrgb&w=500", "featured": True, "tags": ["planta", "orquidea"]},
        {"name": "Mini Jardin Decorativo", "description": "Mini jardin con suculentas variadas en base decorativa.", "price": 65.00, "category": "plantas-decorativas", "subcategory": "plantas-cumpleanos", "image_url": "https://images.pexels.com/photos/8297857/pexels-photo-8297857.jpeg?auto=compress&cs=tinysrgb&w=500", "tags": ["planta", "jardin"]},
        {"name": "Cactus Decorativo Set", "description": "Set de 3 cactus decorativos en macetas de colores.", "price": 55.00, "category": "plantas-decorativas", "subcategory": "plantas-cumpleanos", "image_url": "https://images.pexels.com/photos/8297857/pexels-photo-8297857.jpeg?auto=compress&cs=tinysrgb&w=500", "tags": ["planta", "cactus"]},
    ]
    for p in products:
        p["id"] = str(uuid.uuid4())
        p["available"] = True
        if "featured" not in p:
            p["featured"] = False
        p["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_many(products)
    logger.info(f"Seeded {len(products)} products")

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("category")
    await db.products.create_index("subcategory")
    await seed_admin()
    await seed_products()
    # Write test credentials
    import pathlib
    mem_dir = pathlib.Path("/app/memory")
    mem_dir.mkdir(exist_ok=True)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@atelierfleurs.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    with open(mem_dir / "test_credentials.md", "w") as f:
        f.write(f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/login\n- GET /api/auth/me\n- POST /api/auth/logout\n")

@app.on_event("shutdown")
async def shutdown():
    client.close()
