import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

PRODUCTS = [
    {
        "id": "prod-1",
        "name": "Ramo BTS Purple Edition",
        "description": "Ramo exclusivo inspirado en BTS con flores moradas y doradas. Incluye peluche.",
        "price": 150.00,
        "category": "K-Pop & Temáticos",
        "subcategory": "Universo BTS",
        "image_url": "https://images.unsplash.com/photo-1668767999760-47d1c6fd8647?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwyfHxrb3JlYW4lMjBzdHlsZSUyMGZsb3dlciUyMGJvdXF1ZXR8ZW58MHx8fHwxNzc2MzUwMTM4fDA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-2",
        "name": "Mega Ramo BTS ARMY",
        "description": "Mega ramo con 50 rosas rojas, decoración temática BTS y chocolates Ferrero.",
        "price": 280.00,
        "category": "K-Pop & Temáticos",
        "subcategory": "Universo BTS",
        "image_url": "https://images.unsplash.com/photo-1587316830182-59ca6817ce72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-3",
        "name": "Ramo Stray Kids Edition",
        "description": "Ramo especial Stray Kids con flores azules y blancas. Incluye peluche.",
        "price": 150.00,
        "category": "K-Pop & Temáticos",
        "subcategory": "Universo Stray Kids",
        "image_url": "https://images.unsplash.com/photo-1774975433902-a79ace1d6fa5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-4",
        "name": "Ramo Stitch Azul",
        "description": "Adorable ramo con flores azules y peluche de Stitch. Perfecto para regalo.",
        "price": 120.00,
        "category": "K-Pop & Temáticos",
        "subcategory": "Personajes Animados",
        "image_url": "https://images.unsplash.com/photo-1768448601132-67df7d32e5a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-5",
        "name": "Ramo Hello Kitty Rosa",
        "description": "Ramo rosa pastel con peluche de Hello Kitty. Ideal para ocasiones especiales.",
        "price": 110.00,
        "category": "K-Pop & Temáticos",
        "subcategory": "Personajes Animados",
        "image_url": "https://customer-assets.emergentagent.com/job_c6029fd1-cb7a-4727-ae82-df330720db74/artifacts/edbcdqzz_image.png",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-6",
        "name": "Ramo de Graduación",
        "description": "Ramo elegante con flores amarillas y blancas, perfecto para celebrar el logro.",
        "price": 95.00,
        "category": "Ocasiones Especiales",
        "subcategory": "Graduación",
        "image_url": "https://images.unsplash.com/photo-1587316830182-59ca6817ce72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-7",
        "name": "Ramo Romántico Premium",
        "description": "24 rosas rojas con gypsophila. El clásico para demostrar amor.",
        "price": 180.00,
        "category": "Ocasiones Especiales",
        "subcategory": "Románticos / Aniversario",
        "image_url": "https://images.unsplash.com/photo-1774975433902-a79ace1d6fa5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-8",
        "name": "Ramo San Valentín Deluxe",
        "description": "Ramo especial San Valentín con rosas rojas, chocolates y globo de corazón.",
        "price": 220.00,
        "category": "Ocasiones Especiales",
        "subcategory": "San Valentín",
        "image_url": "https://images.unsplash.com/photo-1768448601132-67df7d32e5a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-9",
        "name": "Rosas Rojas Clásicas",
        "description": "12 rosas rojas frescas. El regalo atemporal.",
        "price": 85.00,
        "category": "Tipos de Flor",
        "subcategory": "Rosas",
        "image_url": "https://images.unsplash.com/photo-1587316830182-59ca6817ce72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-10",
        "name": "Tulipanes Multicolor",
        "description": "Ramo de 20 tulipanes en colores variados. Frescura primaveral.",
        "price": 75.00,
        "category": "Tipos de Flor",
        "subcategory": "Tulipanes",
        "image_url": "https://images.unsplash.com/photo-1774975433902-a79ace1d6fa5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-11",
        "name": "Girasoles Alegres",
        "description": "Ramo de 10 girasoles grandes. Llena de luz cualquier espacio.",
        "price": 70.00,
        "category": "Tipos de Flor",
        "subcategory": "Girasoles",
        "image_url": "https://images.unsplash.com/photo-1768448601132-67df7d32e5a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-12",
        "name": "Ramo Buchón Premium",
        "description": "Ramo estilo buchón con 100 rosas y papel de lujo. Impresionante.",
        "price": 350.00,
        "category": "Estilos y Presentaciones",
        "subcategory": "Ramos Buchones",
        "image_url": "https://images.unsplash.com/photo-1587316830182-59ca6817ce72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-13",
        "name": "Rosas en Caja Elegante",
        "description": "24 rosas en caja de terciopelo negro. Sofisticación pura.",
        "price": 200.00,
        "category": "Estilos y Presentaciones",
        "subcategory": "Rosas en Caja",
        "image_url": "https://images.unsplash.com/photo-1774975433902-a79ace1d6fa5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-14",
        "name": "Peluche Oso Grande",
        "description": "Peluche de oso gigante de 1 metro. Ideal para acompañar flores.",
        "price": 90.00,
        "category": "Peluches",
        "subcategory": "Peluches Individuales Grandes",
        "image_url": "https://images.unsplash.com/photo-1768448601132-67df7d32e5a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "prod-15",
        "name": "Planta Monstera Decorativa",
        "description": "Monstera en maceta decorativa. Perfecta para oficinas y hogares.",
        "price": 65.00,
        "category": "Plantas",
        "subcategory": "Plantas para regalos",
        "image_url": "https://images.unsplash.com/photo-1634886153044-17aff58eb865?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHw0fHxpbmRvb3IlMjBwbGFudHMlMjBwb3R8ZW58MHx8fHwxNzc2MzUwMTM4fDA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": "2026-01-15T10:00:00Z"
    },
]

async def seed_products():
    print("Seeding products...")
    
    # Check if products already exist
    existing_count = await db.products.count_documents({})
    if existing_count > 0:
        print(f"Products already exist ({existing_count}). Skipping seed.")
        return
    
    # Insert products
    await db.products.insert_many(PRODUCTS)
    print(f"Successfully seeded {len(PRODUCTS)} products!")

if __name__ == "__main__":
    asyncio.run(seed_products())
    client.close()
