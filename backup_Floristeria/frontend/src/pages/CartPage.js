import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingCart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useCart } from "@/contexts/CartContext";
import { WHATSAPP_NUMBER, YAPE_QR } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, count } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [yapeOpen, setYapeOpen] = useState(false);

  const buildWhatsAppMessage = () => {
    let msg = `Hola! Quiero hacer un pedido en Floristeria Atelier Fleurs:\n\n`;
    items.forEach(item => {
      msg += `- ${item.name} x${item.quantity} - S/${(item.price * item.quantity).toFixed(2)}\n`;
    });
    msg += `\nTotal: S/${total.toFixed(2)}`;
    if (customerName) msg += `\nNombre: ${customerName}`;
    if (customerPhone) msg += `\nTelefono: ${customerPhone}`;
    if (customerEmail) msg += `\nEmail: ${customerEmail}`;
    if (notes) msg += `\nNotas: ${notes}`;
    return msg;
  };

  const handleWhatsAppOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Por favor ingresa tu nombre y telefono");
      return;
    }
    // Save order to backend
    try {
      await axios.post(`${API}/orders`, {
        items: items.map(i => ({ product_id: i.id, product_name: i.name, quantity: i.quantity, price: i.price })),
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        notes,
        total
      });
    } catch (err) {
      console.error("Error saving order:", err);
    }

    const msg = buildWhatsAppMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Pedido enviado por WhatsApp!");
    clearCart();
  };

  if (count === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" data-testid="cart-empty">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" strokeWidth={1} />
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'Outfit' }}>Tu carrito esta vacio</h1>
        <p className="text-muted-foreground mt-2">Agrega productos para empezar tu pedido</p>
        <Link to="/">
          <Button className="mt-6 rounded-full bg-primary hover:bg-primary/90 text-white" data-testid="continue-shopping">
            Ver Catalogo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12" data-testid="cart-page">
      <h1 className="text-3xl tracking-tight font-medium mb-8" style={{ fontFamily: 'Outfit' }}>Tu Carrito ({count})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 bg-card rounded-2xl border border-border p-4" data-testid={`cart-item-${item.id}`}>
              <img src={item.image_url} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to={`/producto/${item.id}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-2">{item.name}</Link>
                <p className="text-primary font-bold mt-1">S/{item.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)} data-testid={`cart-decrease-${item.id}`}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)} data-testid={`cart-increase-${item.id}`}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="font-bold text-sm">S/{(item.price * item.quantity).toFixed(2)}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeItem(item.id)} data-testid={`cart-remove-${item.id}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>Resumen del Pedido</h2>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">S/{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-muted-foreground text-xs">Consultar por WhatsApp</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary" data-testid="cart-total">S/{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'Outfit' }}>Datos de Contacto</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs">Nombre *</Label>
                <Input id="name" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Tu nombre" data-testid="customer-name" />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs">Telefono *</Label>
                <Input id="phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="922458758" data-testid="customer-phone" />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs">Email (opcional)</Label>
                <Input id="email" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="tu@email.com" data-testid="customer-email" />
              </div>
              <div>
                <Label htmlFor="notes" className="text-xs">Notas (opcional)</Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Indicaciones especiales..." rows={2} data-testid="customer-notes" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white gap-2 h-12" onClick={handleWhatsAppOrder} data-testid="whatsapp-checkout-button">
              <MessageCircle className="h-5 w-5" /> Pedir por WhatsApp
            </Button>

            <Dialog open={yapeOpen} onOpenChange={setYapeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full rounded-full h-12 gap-2" data-testid="yape-button">
                  Pagar con Yape
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm" data-testid="yape-dialog">
                <DialogHeader>
                  <DialogTitle>Pagar con Yape</DialogTitle>
                  <DialogDescription>Escanea el QR con tu app de Yape para realizar el pago de S/{total.toFixed(2)}</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                  <img src={YAPE_QR} alt="Yape QR" className="w-64 h-64 object-contain rounded-xl" />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Despues de pagar, envia el comprobante por WhatsApp
                </p>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
