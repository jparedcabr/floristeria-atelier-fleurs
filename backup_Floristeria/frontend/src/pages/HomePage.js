import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Heart, Truck } from "lucide-react";
import axios from "axios";
import { CATEGORIES, BRAND_LOGO } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=1400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1730749387748-79e6d50a269c?w=1400&h=600&fit=crop",
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);

  const fetchFeatured = useCallback(() => {
    axios.get(`${API}/products?featured=true`)
      .then(r => setFeatured(r.data.slice(0, 8)))
      .catch(err => console.error("Error fetching featured:", err));
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  useEffect(() => {
    const len = HERO_IMAGES.length;
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % len), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden" data-testid="hero-section">
        {HERO_IMAGES.map((img) => (
          <img
            key={img}
            src={img}
            alt="Flores"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${img === HERO_IMAGES[heroIdx] ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-xl space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <img src={BRAND_LOGO} alt="Logo" className="h-14 w-14 rounded-full object-cover border-2 border-white/30" />
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-white/80">Floristeria</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium text-white" style={{ fontFamily: 'Outfit' }}>
              Atelier Fleurs
            </h1>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed">
              Creamos arreglos florales unicos. Desde ramos tematicos K-Pop hasta clasicos romanticos. Entrega a domicilio.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/categoria/kpop-tematicos">
                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2" data-testid="hero-cta-catalogo">
                  Ver Catalogo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/personalizar">
                <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 gap-2" data-testid="hero-cta-personalizar">
                  <Sparkles className="h-4 w-4" /> Personalizar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <Truck className="h-5 w-5 text-primary shrink-0" strokeWidth={1.5} />
              <span className="text-sm font-medium">Delivery a domicilio</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Heart className="h-5 w-5 text-primary shrink-0" strokeWidth={1.5} />
              <span className="text-sm font-medium">Hechos con amor</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0" strokeWidth={1.5} />
              <span className="text-sm font-medium">Personaliza tu ramo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20" data-testid="categories-section">
        <div className="text-center mb-10">
          <span className="text-xs tracking-[0.2em] uppercase font-bold text-primary">Nuestras Categorias</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-semibold mt-2" style={{ fontFamily: 'Outfit' }}>
            Encuentra el regalo perfecto
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className={`group relative overflow-hidden rounded-2xl ${i === 0 ? 'sm:col-span-2 lg:col-span-2 min-h-[280px]' : 'min-h-[220px]'} animate-slide-up`}
              style={{ animationDelay: `${i * 100}ms` }}
              data-testid={`category-card-${cat.slug}`}
            >
              <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <h3 className="text-white text-xl sm:text-2xl font-medium" style={{ fontFamily: 'Outfit' }}>{cat.name}</h3>
                <p className="text-white/70 text-sm mt-1">{cat.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {cat.subcategories.slice(0, 4).map(sub => (
                    <span key={sub.slug} className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                      {sub.name}
                    </span>
                  ))}
                  {cat.subcategories.length > 4 && (
                    <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                      +{cat.subcategories.length - 4} mas
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="bg-muted/50 py-12 lg:py-20" data-testid="featured-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs tracking-[0.2em] uppercase font-bold text-primary">Lo Mas Vendido</span>
                <h2 className="text-2xl sm:text-3xl tracking-tight font-semibold mt-1" style={{ fontFamily: 'Outfit' }}>
                  Productos Destacados
                </h2>
              </div>
              <Link to="/categoria/tipos-de-flor">
                <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80" data-testid="view-all-products">
                  Ver todos <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Custom Builder CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20" data-testid="builder-cta-section">
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&h=500&fit=crop"
            alt="Personalizar"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-lg">
            <span className="text-xs tracking-[0.2em] uppercase font-bold text-white/80">Exclusivo</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-semibold text-white mt-3" style={{ fontFamily: 'Outfit' }}>
              Arma tu Ramo Personalizado
            </h2>
            <p className="text-white/80 mt-3 leading-relaxed">
              Elige tus flores favoritas, el estilo de presentacion y agrega extras especiales. Creamos tu arreglo ideal.
            </p>
            <Link to="/personalizar">
              <Button size="lg" className="mt-6 rounded-full bg-white text-primary hover:bg-white/90 gap-2" data-testid="builder-cta-button">
                <Sparkles className="h-4 w-4" /> Empezar a Crear
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
