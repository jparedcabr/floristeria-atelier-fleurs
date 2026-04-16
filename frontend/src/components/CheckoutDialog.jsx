import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { Tag, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CheckoutDialog = ({ open, onOpenChange }) => {
  const { cart, getTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [couponsEnabled, setCouponsEnabled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setCouponsEnabled(response.data.coupons_enabled);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Ingresa un código de cupón');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await axios.post(`${API}/coupons/validate`, {
        code: couponCode,
        total: getTotal(),
      });

      setAppliedCoupon(response.data);
      setDiscount(response.data.discount_amount);
      toast.success(`¡Cupón aplicado! Descuento de S/ ${response.data.discount_amount.toFixed(2)}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Cupón inválido');
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    toast.info('Cupón removido');
  };

  const getFinalTotal = () => {
    return appliedCoupon ? appliedCoupon.new_total : getTotal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await axios.post(`${API}/orders`, {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: getFinalTotal(),
      });

      setStep(2);
    } catch (error) {
      toast.error('Error al procesar el pedido');
      console.error(error);
    }
  };

  const generateWhatsAppMessage = () => {
    const items = cart.map(item => 
      `- ${item.name} x${item.quantity} - S/ ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    let message = `¡Hola! Me gustaría hacer el siguiente pedido:\n\nNombre: ${formData.name}\nEmail: ${formData.email}\nTeléfono: ${formData.phone}\n\nPedido:\n${items}\n\nSubtotal: S/ ${getTotal().toFixed(2)}`;
    
    if (appliedCoupon) {
      message += `\nDescuento (${appliedCoupon.discount_type === 'percentage' ? appliedCoupon.discount_value + '%' : 'S/ ' + appliedCoupon.discount_value}): -S/ ${discount.toFixed(2)}`;
    }
    
    message += `\n\nTotal: S/ ${getFinalTotal().toFixed(2)}\n\n¡Gracias!`;
    
    return `https://wa.me/51922458758?text=${encodeURIComponent(message)}`;
  };

  const handleFinish = () => {
    window.open(generateWhatsAppMessage(), '_blank');
    clearCart();
    onOpenChange(false);
    setStep(1);
    setFormData({ name: '', email: '', phone: '' });
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscount(0);
    toast.success('Pedido enviado con éxito');
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg shadow-2xl" data-testid="checkout-dialog">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-center" data-testid="checkout-title">
                Finalizar Pedido
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4" data-testid="checkout-form">
              <div>
                <Label htmlFor="name" className="text-base">Nombre Completo</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  data-testid="checkout-input-name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  data-testid="checkout-input-email"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-base">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  data-testid="checkout-input-phone"
                />
              </div>

              {couponsEnabled && (
                <div className="bg-accent/50 p-4 rounded-xl border-2 border-primary/20">
                  <Label htmlFor="coupon" className="text-base flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    ¿Tienes un cupón de descuento?
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Código"
                      disabled={appliedCoupon !== null}
                      className="uppercase"
                      data-testid="checkout-input-coupon"
                    />
                    {appliedCoupon ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveCoupon}
                        className="whitespace-nowrap"
                        data-testid="checkout-remove-coupon"
                      >
                        Remover
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="whitespace-nowrap"
                        data-testid="checkout-apply-coupon"
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                      </Button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-primary font-semibold mt-2">
                      ✓ Cupón aplicado: {appliedCoupon.discount_type === 'percentage' 
                        ? `${appliedCoupon.discount_value}% de descuento` 
                        : `S/ ${appliedCoupon.discount_value} de descuento`}
                    </p>
                  )}
                </div>
              )}

              <div className="border-t pt-4 bg-muted/30 p-4 rounded-xl">
                <h4 className="font-semibold text-lg mb-3">Resumen del Pedido</h4>
                <div className="space-y-2 text-sm" data-testid="checkout-summary">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium text-base pt-2 border-t">
                    <span>Subtotal:</span>
                    <span>S/ {getTotal().toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-primary font-medium">
                      <span>Descuento:</span>
                      <span>-S/ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl pt-2 border-t-2 border-primary/30">
                    <span>Total:</span>
                    <span data-testid="checkout-total" className="text-primary">
                      S/ {getFinalTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all" data-testid="checkout-continue-button">
                Continuar al Pago
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-center" data-testid="payment-title">
                Método de Pago
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4" data-testid="payment-section">
              <p className="text-center text-lg">
                Escanea el código QR de Yape para realizar el pago
              </p>
              <div className="flex justify-center bg-white p-6 rounded-2xl shadow-inner">
                <img
                  src="https://customer-assets.emergentagent.com/job_c6029fd1-cb7a-4727-ae82-df330720db74/artifacts/cr6vrjyn_image.png"
                  alt="Yape QR"
                  className="w-72 h-72 object-contain"
                  data-testid="yape-qr-image"
                />
              </div>
              <div className="bg-primary/10 p-6 rounded-xl border-2 border-primary/30">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Total a pagar:</span>
                  <span data-testid="payment-total" className="text-3xl font-bold text-primary">
                    S/ {getFinalTotal().toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-center text-muted-foreground">
                Después de realizar el pago, confirma tu pedido por WhatsApp
              </p>
              <Button 
                onClick={handleFinish} 
                className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all" 
                data-testid="payment-whatsapp-button"
              >
                Confirmar por WhatsApp
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
