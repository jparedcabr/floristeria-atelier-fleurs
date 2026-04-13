export const WHATSAPP_NUMBER = "51922458758";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const EMAIL = "jungle.dev.jp@gmail.com";
export const TIKTOK_USER = "floristeriaatelierfleurs";
export const TIKTOK_URL = `https://www.tiktok.com/@${TIKTOK_USER}`;
export const BRAND_LOGO = "https://customer-assets.emergentagent.com/job_71de412d-8c1f-4a5d-93c8-a1fb33bb4dc3/artifacts/pf7rppy5_image.png";
export const YAPE_QR = "https://customer-assets.emergentagent.com/job_71de412d-8c1f-4a5d-93c8-a1fb33bb4dc3/artifacts/qmrne475_image.png";

export const CATEGORIES = [
  {
    slug: "kpop-tematicos",
    name: "K-Pop & Tematicos",
    description: "Ramos y arreglos tematicos de K-Pop y personajes animados",
    image: "https://images.unsplash.com/photo-1541275055241-329bbdf9a191?w=600&h=400&fit=crop",
    subcategories: [
      { slug: "universo-bts", name: "Universo BTS", description: "Ramos, Mega Ramos, Cajas" },
      { slug: "universo-stray-kids", name: "Universo Stray Kids", description: "Ramos, Mega Ramos, Cajas" },
      { slug: "personajes-animados", name: "Personajes Animados", description: "Snoopy, Stitch, Lotso, Hello Kitty, Angela, Lucifer" }
    ]
  },
  {
    slug: "ocasiones-especiales",
    name: "Ocasiones Especiales",
    description: "Flores para cada momento especial de tu vida",
    image: "https://images.unsplash.com/photo-1613539246066-78db6ec4ff0f?w=600&h=400&fit=crop",
    subcategories: [
      { slug: "graduacion", name: "Graduacion" },
      { slug: "para-hombre", name: "Para Hombre" },
      { slug: "romanticos-aniversario", name: "Romanticos / Aniversario" },
      { slug: "dia-de-la-madre", name: "Dia de la Madre" },
      { slug: "san-valentin", name: "San Valentin" },
      { slug: "flores-amarillas", name: "Flores Amarillas" }
    ]
  },
  {
    slug: "tipos-de-flor",
    name: "Tipos de Flor",
    description: "Para el cliente tradicional que busca su flor favorita",
    image: "https://images.unsplash.com/photo-1769990878496-c809190201b9?w=600&h=400&fit=crop",
    subcategories: [
      { slug: "rosas", name: "Rosas" },
      { slug: "tulipanes", name: "Tulipanes" },
      { slug: "lilium", name: "Lilium" },
      { slug: "girasoles", name: "Girasoles" },
      { slug: "gerberas", name: "Gerberas" }
    ]
  },
  {
    slug: "estilos-presentaciones",
    name: "Estilos y Presentaciones",
    description: "Diferentes formas de presentar nuestras flores",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=400&fit=crop",
    subcategories: [
      { slug: "ramos-buchones", name: "Ramos Buchones" },
      { slug: "sombrereras-arreglos", name: "Sombrereras y Arreglos" },
      { slug: "ramos-individuales", name: "Ramos Individuales" },
      { slug: "rosas-en-caja", name: "Rosas en Caja" }
    ]
  },
  {
    slug: "peluches",
    name: "Peluches",
    description: "Peluches individuales grandes para regalar",
    image: "https://images.pexels.com/photos/9119278/pexels-photo-9119278.jpeg?auto=compress&cs=tinysrgb&w=600",
    subcategories: [
      { slug: "peluches-grandes", name: "Peluches Individuales Grandes" }
    ]
  },
  {
    slug: "plantas-decorativas",
    name: "Plantas Decorativas",
    description: "Plantas para regalos decorativos, oficinas y cumpleanos",
    image: "https://images.pexels.com/photos/8297857/pexels-photo-8297857.jpeg?auto=compress&cs=tinysrgb&w=600",
    subcategories: [
      { slug: "plantas-oficina", name: "Plantas para Oficina" },
      { slug: "plantas-cumpleanos", name: "Plantas para Cumpleanos" }
    ]
  }
];

export const BUILDER_FLOWERS = [
  { id: "rosas-rojas", name: "Rosas Rojas", price: 5, image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=200&h=200&fit=crop" },
  { id: "rosas-rosadas", name: "Rosas Rosadas", price: 5, image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=200&h=200&fit=crop" },
  { id: "tulipanes", name: "Tulipanes", price: 7, image: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=200&h=200&fit=crop" },
  { id: "girasoles", name: "Girasoles", price: 6, image: "https://images.unsplash.com/photo-1518882054726-f1a04a8eb661?w=200&h=200&fit=crop" },
  { id: "lilium", name: "Lilium", price: 8, image: "https://images.unsplash.com/photo-1568702846914-96b305d2ead1?w=200&h=200&fit=crop" },
  { id: "gerberas", name: "Gerberas", price: 4, image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=200&h=200&fit=crop" },
];

export const BUILDER_STYLES = [
  { id: "ramo", name: "Ramo Clasico", price: 15 },
  { id: "ramo-buchon", name: "Ramo Buchon", price: 30 },
  { id: "caja", name: "Caja Floral", price: 25 },
  { id: "sombrerera", name: "Sombrerera", price: 35 },
];

export const BUILDER_EXTRAS = [
  { id: "peluche-pequeno", name: "Peluche Pequeno", price: 25 },
  { id: "peluche-grande", name: "Peluche Grande", price: 60 },
  { id: "chocolates", name: "Chocolates", price: 20 },
  { id: "globo", name: "Globo Metalizado", price: 15 },
  { id: "tarjeta", name: "Tarjeta Personalizada", price: 5 },
];

export function getCategoryBySlug(slug) {
  return CATEGORIES.find(c => c.slug === slug);
}

export function getSubcategoryBySlug(categorySlug, subcategorySlug) {
  const cat = getCategoryBySlug(categorySlug);
  if (!cat) return null;
  return cat.subcategories.find(s => s.slug === subcategorySlug);
}
