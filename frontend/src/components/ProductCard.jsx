import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success('Agregado al carrito', {
      style: {
        background: '#fff',
        color: '#1B4332',
        border: '1px solid #F8BBD0'
      }
    });
  };

  return (
    <Link to={`/producto/${product.id}`} data-testid={`product-card-${product.id}`}>
      <Card className="group overflow-hidden border border-border/50 shadow-md hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 bg-white rounded-2xl">
        <div className="aspect-square overflow-hidden bg-accent/20">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            data-testid={`product-image-${product.id}`}
          />
        </div>
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-semibold text-secondary group-hover:text-primary transition-colors" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 min-h-[2.5rem]" data-testid={`product-description-${product.id}`}>
            {product.description}
          </p>
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-muted-foreground block">Precio</span>
              <span className="text-3xl font-bold text-primary" data-testid={`product-price-${product.id}`}>
                S/ {product.price.toFixed(2)}
              </span>
            </div>
            <Button
              size="icon"
              onClick={handleAddToCart}
              className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
              data-testid={`product-add-cart-${product.id}`}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
