import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import CheckoutDialog from '@/components/CheckoutDialog';

const CartDrawer = ({ children }) => {
  const { cart, updateQuantity, removeFromCart, getTotal } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg" data-testid="cart-drawer">
          <SheetHeader>
            <SheetTitle className="text-2xl" data-testid="cart-title">Tu Carrito</SheetTitle>
          </SheetHeader>

          <div className="mt-8 space-y-4" data-testid="cart-items">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="cart-empty-message">
                Tu carrito está vacío
              </p>
            ) : (
              cart.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-border pb-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    data-testid={`cart-item-image-${item.id}`}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium" data-testid={`cart-item-name-${item.id}`}>{item.name}</h4>
                    <p className="text-sm text-muted-foreground" data-testid={`cart-item-price-${item.id}`}>
                      S/ {item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        data-testid={`cart-item-decrease-${item.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-8 text-center" data-testid={`cart-item-quantity-${item.id}`}>
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        data-testid={`cart-item-increase-${item.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                    data-testid={`cart-item-remove-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
              <div className="w-full space-y-4">
                <div className="flex justify-between text-lg font-semibold" data-testid="cart-total">
                  <span>Total:</span>
                  <span data-testid="cart-total-amount">S/ {getTotal().toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setIsOpen(false);
                    setShowCheckout(true);
                  }}
                  data-testid="cart-checkout-button"
                >
                  Finalizar Pedido
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
      />
    </>
  );
};

export default CartDrawer;
