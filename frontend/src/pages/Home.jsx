import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, settingsRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/settings`),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-white" data-testid="home-page">
      <Header />

      {/* Hero Banner Section */}
      <section className="relative h-[70vh] overflow-hidden" data-testid="hero-section">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${settings?.hero_banner_url || 'https://images.unsplash.com/photo-1587316830182-59ca6817ce72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85'})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent"></div>
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-primary font-semibold tracking-wide uppercase text-sm">Boutique Floral</span>
            </div>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6 text-secondary"
              data-testid="hero-title"
            >
              Floristería Atelier Fleurs
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-muted-foreground" data-testid="hero-subtitle">
              Arreglos exclusivos y diseños personalizados que transforman cada momento en algo inolvidable
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="text-lg px-10 py-7 shadow-xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 rounded-full" data-testid="hero-cta-shop">
                <Link to="/categoria/kpop-tematicos">Explorar Catálogo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/95 hover:bg-white text-secondary border-2 border-secondary/20 text-lg px-10 py-7 shadow-xl hover:scale-105 transition-all duration-300 rounded-full" data-testid="hero-cta-custom">
                <Link to="/arma-tu-ramo">Arma tu Ramo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-gradient-to-b from-white to-accent/30" data-testid="categories-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-4 text-secondary" data-testid="categories-title">
              Nuestras Colecciones
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestra selección curada de arreglos florales para cada ocasión especial
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/categoria/${category.slug}`}
                className="group relative h-72 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                data-testid={`category-card-${category.slug}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-3xl font-bold text-white group-hover:text-primary transition-colors mb-2" data-testid={`category-name-${category.slug}`}>
                    {category.name}
                  </h3>
                  <span className="text-white/80 text-sm">Ver colección →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white" data-testid="featured-products-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-4 text-secondary" data-testid="featured-title">
              Productos Destacados
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Los favoritos de nuestros clientes, diseñados con pasión y dedicación
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-20" data-testid="loading-spinner">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Custom Bouquet CTA */}
      <section className="py-24 bg-gradient-to-br from-accent/50 via-white to-accent/30 relative overflow-hidden" data-testid="custom-cta-section">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-6 text-secondary" data-testid="custom-cta-title">
            Crea tu Ramo Personalizado
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto" data-testid="custom-cta-description">
            Elige tus flores favoritas, la cantidad perfecta y el estilo de presentación ideal. Diseña un arreglo único que exprese exactamente lo que sientes.
          </p>
          <Button asChild size="lg" className="text-xl px-14 py-8 shadow-2xl hover:shadow-primary/50 hover:scale-110 transition-all duration-300 rounded-full" data-testid="custom-cta-button">
            <Link to="/arma-tu-ramo">Comenzar a Diseñar</Link>
          </Button>
        </div>
      </section>

      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default Home;