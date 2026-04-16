import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} ${quantity === 1 ? 'producto agregado' : 'productos agregados'} al carrito`);
  };

  if (loading) {
    return (
      <div className="min-h-screen" data-testid="product-page-loading">
        <Header />
        <div className="flex justify-center items-center py-40">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen" data-testid="product-page-not-found">
        <Header />
        <div className="container mx-auto px-4 py-40 text-center">
          <h1 className="text-4xl mb-4">Producto no encontrado</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="product-page">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="product-detail-image"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl mb-4" data-testid="product-detail-name">
                  {product.name}
                </h1>
                <p className="text-3xl font-semibold text-primary" data-testid="product-detail-price">
                  S/ {product.price.toFixed(2)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="product-detail-description">
                  {product.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Categoría</h3>
                <p className="text-muted-foreground" data-testid="product-detail-category">{product.category}</p>
              </div>

              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-4">
                  <label className="font-medium">Cantidad:</label>
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      data-testid="product-quantity-decrease"
                    >
                      -
                    </Button>
                    <span className="px-6" data-testid="product-quantity-display">{quantity}</span>
                    <Button
                      variant="ghost"
                      onClick={() => setQuantity(quantity + 1)}
                      data-testid="product-quantity-increase"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  data-testid="product-add-to-cart"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Agregar al Carrito
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductPage;
