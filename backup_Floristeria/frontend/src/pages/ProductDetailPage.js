import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, ArrowLeft, Heart } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/ProductCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProduct = useCallback(() => {
    setLoading(true);
    setQuantity(1);
    axios.get(`${API}/products/${productId}`)
      .then(r => {
        setProduct(r.data);
        return axios.get(`${API}/products?category=${r.data.category}&subcategory=${r.data.subcategory}`);
      })
      .then(r => setRelated(r.data.filter(p => p.id !== productId).slice(0, 4)))
      .catch(() => toast.error("Producto no encontrado"))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-6 bg-muted rounded animate-pulse w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} x${quantity} agregado al carrito`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12" data-testid="product-detail-page">
      {/* Back Button */}
      <Link to={`/categoria/${product.category}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6" data-testid="back-to-category">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-muted" data-testid="product-image">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            {product.featured && (
              <Badge className="bg-primary text-white mb-3">Destacado</Badge>
            )}
            <h1 className="text-3xl sm:text-4xl tracking-tight font-medium" style={{ fontFamily: 'Outfit' }} data-testid="product-name">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary mt-3" data-testid="product-price">
              S/{product.price.toFixed(2)}
            </p>
          </div>

          <Separator />

          <p className="text-muted-foreground leading-relaxed" data-testid="product-description">
            {product.description}
          </p>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="rounded-full text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Quantity */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Cantidad</label>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="rounded-full" data-testid="quantity-decrease">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center" data-testid="quantity-value">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)} className="rounded-full" data-testid="quantity-increase">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white gap-2" onClick={handleAddToCart} data-testid="add-to-cart-button">
              <ShoppingCart className="h-4 w-4" /> Agregar al Carrito - S/{(product.price * quantity).toFixed(2)}
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" data-testid="wishlist-button">
              <Heart className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight mb-6" style={{ fontFamily: 'Outfit' }}>Productos Relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
