import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const FLOWER_TYPES = [
  { name: 'Rosas', basePrice: 80 },
  { name: 'Tulipanes', basePrice: 70 },
  { name: 'Lilium', basePrice: 90 },
  { name: 'Girasoles', basePrice: 75 },
  { name: 'Gerberas', basePrice: 65 },
];

const PRESENTATIONS = [
  { name: 'Ramo', multiplier: 1 },
  { name: 'Caja', multiplier: 1.3 },
  { name: 'Sombrerera', multiplier: 1.5 },
];

const CustomBouquet = () => {
  const { addToCart } = useCart();
  const [step, setStep] = useState('flower');
  const [config, setConfig] = useState({
    flower: '',
    quantity: 12,
    presentation: '',
  });

  const calculatePrice = () => {
    if (!config.flower || !config.presentation) return 0;
    
    const flower = FLOWER_TYPES.find(f => f.name === config.flower);
    const presentation = PRESENTATIONS.find(p => p.name === config.presentation);
    
    if (!flower || !presentation) return 0;
    
    return flower.basePrice * (config.quantity / 12) * presentation.multiplier;
  };

  const handleAddToCart = () => {
    if (!config.flower || !config.presentation) {
      toast.error('Por favor completa toda la configuración');
      return;
    }

    const customProduct = {
      id: `custom-${Date.now()}`,
      name: `Ramo Personalizado - ${config.quantity} ${config.flower}`,
      description: `${config.quantity} ${config.flower} en ${config.presentation}`,
      price: calculatePrice(),
      category: 'Personalizado',
      image_url: 'https://images.unsplash.com/photo-1587316830182-59ca6817ce72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxiZWF1dGlmdWwlMjBmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHBhc3RlbHxlbnwwfHx8fDE3NzYzNTAxMzh8MA&ixlib=rb-4.1.0&q=85',
    };

    addToCart(customProduct);
    toast.success('Ramo personalizado agregado al carrito');
    setConfig({ flower: '', quantity: 12, presentation: '' });
    setStep('flower');
  };

  return (
    <div className="min-h-screen" data-testid="custom-bouquet-page">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-center mb-8" data-testid="custom-title">
            Arma tu Ramo Personalizado
          </h1>
          <p className="text-center text-muted-foreground mb-12" data-testid="custom-subtitle">
            Elige el tipo de flor, la cantidad y la presentación perfecta para tu ocasión especial
          </p>

          <Card className="p-8">
            <Tabs value={step} onValueChange={setStep} data-testid="custom-tabs">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="flower" data-testid="tab-flower">1. Tipo de Flor</TabsTrigger>
                <TabsTrigger value="quantity" data-testid="tab-quantity">2. Cantidad</TabsTrigger>
                <TabsTrigger value="presentation" data-testid="tab-presentation">3. Presentación</TabsTrigger>
              </TabsList>

              <TabsContent value="flower" className="space-y-6" data-testid="step-flower">
                <div>
                  <Label className="text-lg mb-4 block">Selecciona el tipo de flor</Label>
                  <select
                    value={config.flower}
                    onChange={(e) => setConfig(prev => ({ ...prev, flower: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-white"
                    data-testid="select-flower"
                  >
                    <option value="">Elige una flor</option>
                    {FLOWER_TYPES.map(flower => (
                      <option key={flower.name} value={flower.name} data-testid={`flower-option-${flower.name}`}>
                        {flower.name} - Desde S/ {flower.basePrice}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={() => setStep('quantity')} disabled={!config.flower} data-testid="button-next-quantity">
                  Siguiente
                </Button>
              </TabsContent>

              <TabsContent value="quantity" className="space-y-6" data-testid="step-quantity">
                <div>
                  <Label className="text-lg mb-4 block">Cantidad de flores</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="6"
                      max="100"
                      step="6"
                      value={config.quantity}
                      onChange={(e) => setConfig(prev => ({ ...prev, quantity: parseInt(e.target.value) || 12 }))}
                      data-testid="input-quantity"
                    />
                    <span className="text-sm text-muted-foreground">flores</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Mínimo 6 flores. Se recomienda múltiplos de 6.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep('flower')} data-testid="button-back-flower">
                    Atrás
                  </Button>
                  <Button onClick={() => setStep('presentation')} disabled={config.quantity < 6} data-testid="button-next-presentation">
                    Siguiente
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="presentation" className="space-y-6" data-testid="step-presentation">
                <div>
                  <Label className="text-lg mb-4 block">Tipo de presentación</Label>
                  <select
                    value={config.presentation}
                    onChange={(e) => setConfig(prev => ({ ...prev, presentation: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-white"
                    data-testid="select-presentation"
                  >
                    <option value="">Elige una presentación</option>
                    {PRESENTATIONS.map(pres => (
                      <option key={pres.name} value={pres.name} data-testid={`presentation-option-${pres.name}`}>
                        {pres.name}
                      </option>
                    ))}
                  </select>
                </div>

                {config.flower && config.presentation && (
                  <div className="bg-primary/10 p-6 rounded-lg" data-testid="price-summary">
                    <h3 className="text-xl font-semibold mb-2">Resumen</h3>
                    <p className="text-muted-foreground mb-1">
                      {config.quantity} {config.flower} en {config.presentation}
                    </p>
                    <p className="text-3xl font-semibold text-primary" data-testid="custom-total-price">
                      S/ {calculatePrice().toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep('quantity')} data-testid="button-back-quantity">
                    Atrás
                  </Button>
                  <Button onClick={handleAddToCart} disabled={!config.presentation} data-testid="button-add-custom-cart">
                    Agregar al Carrito
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CustomBouquet;
