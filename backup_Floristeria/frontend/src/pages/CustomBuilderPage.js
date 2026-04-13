import { useState } from "react";
import { Plus, Minus, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BUILDER_FLOWERS, BUILDER_STYLES, BUILDER_EXTRAS, WHATSAPP_NUMBER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomBuilderPage() {
  const [flowers, setFlowers] = useState({});
  const [style, setStyle] = useState(null);
  const [extras, setExtras] = useState({});
  const [activeTab, setActiveTab] = useState("flores");

  const addFlower = (id) => setFlowers(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFlower = (id) => setFlowers(prev => {
    const n = (prev[id] || 0) - 1;
    if (n <= 0) { const { [id]: _, ...rest } = prev; return rest; }
    return { ...prev, [id]: n };
  });
  const toggleExtra = (id) => setExtras(prev => {
    if (prev[id]) { const { [id]: _, ...rest } = prev; return rest; }
    return { ...prev, [id]: true };
  });

  const flowerTotal = Object.entries(flowers).reduce((sum, [id, qty]) => {
    const f = BUILDER_FLOWERS.find(fl => fl.id === id);
    return sum + (f ? f.price * qty : 0);
  }, 0);
  const stylePrice = style ? BUILDER_STYLES.find(s => s.id === style)?.price || 0 : 0;
  const extrasTotal = Object.keys(extras).reduce((sum, id) => {
    const e = BUILDER_EXTRAS.find(ex => ex.id === id);
    return sum + (e ? e.price : 0);
  }, 0);
  const grandTotal = flowerTotal + stylePrice + extrasTotal;
  const flowerCount = Object.values(flowers).reduce((a, b) => a + b, 0);

  const handleSendWhatsApp = () => {
    if (flowerCount === 0) { toast.error("Selecciona al menos una flor"); return; }
    if (!style) { toast.error("Selecciona un estilo de presentacion"); return; }

    let msg = "Hola! Quiero armar un ramo personalizado:\n\n";
    msg += "Flores:\n";
    Object.entries(flowers).forEach(([id, qty]) => {
      const f = BUILDER_FLOWERS.find(fl => fl.id === id);
      if (f) msg += `- ${f.name} x${qty} - S/${(f.price * qty).toFixed(2)}\n`;
    });
    const s = BUILDER_STYLES.find(st => st.id === style);
    msg += `\nEstilo: ${s?.name} - S/${stylePrice.toFixed(2)}`;
    if (Object.keys(extras).length > 0) {
      msg += "\n\nExtras:";
      Object.keys(extras).forEach(id => {
        const e = BUILDER_EXTRAS.find(ex => ex.id === id);
        if (e) msg += `\n- ${e.name} - S/${e.price.toFixed(2)}`;
      });
    }
    msg += `\n\nTotal estimado: S/${grandTotal.toFixed(2)}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12" data-testid="custom-builder-page">
      <div className="text-center mb-10">
        <span className="text-xs tracking-[0.2em] uppercase font-bold text-primary flex items-center justify-center gap-1">
          <Sparkles className="h-4 w-4" /> Exclusivo
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tighter font-medium mt-2" style={{ fontFamily: 'Outfit' }}>
          Arma tu Ramo Personalizado
        </h1>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
          Elige tus flores, estilo y extras para crear el arreglo perfecto
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Builder */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full" data-testid="builder-tabs">
              <TabsTrigger value="flores" data-testid="tab-flores">1. Flores</TabsTrigger>
              <TabsTrigger value="estilo" data-testid="tab-estilo">2. Estilo</TabsTrigger>
              <TabsTrigger value="extras" data-testid="tab-extras">3. Extras</TabsTrigger>
            </TabsList>

            <TabsContent value="flores" className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {BUILDER_FLOWERS.map(f => {
                  const qty = flowers[f.id] || 0;
                  return (
                    <div key={f.id} className={`bg-card rounded-2xl border p-4 transition-all ${qty > 0 ? 'border-primary shadow-sm' : 'border-border'}`} data-testid={`flower-${f.id}`}>
                      <img src={f.image} alt={f.name} className="w-full aspect-square rounded-xl object-cover mb-3" loading="lazy" />
                      <h4 className="font-medium text-sm" style={{ fontFamily: 'Outfit' }}>{f.name}</h4>
                      <p className="text-primary font-bold text-sm">S/{f.price.toFixed(2)} c/u</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => removeFlower(f.id)} disabled={qty === 0} data-testid={`flower-decrease-${f.id}`}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{qty}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => addFlower(f.id)} data-testid={`flower-increase-${f.id}`}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="estilo" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BUILDER_STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`bg-card rounded-2xl border p-6 text-left transition-all ${style === s.id ? 'border-primary shadow-sm ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                    data-testid={`style-${s.id}`}
                  >
                    <h4 className="font-medium text-lg" style={{ fontFamily: 'Outfit' }}>{s.name}</h4>
                    <p className="text-primary font-bold mt-1">+ S/{s.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="extras" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BUILDER_EXTRAS.map(e => (
                  <button
                    key={e.id}
                    onClick={() => toggleExtra(e.id)}
                    className={`bg-card rounded-2xl border p-6 text-left transition-all ${extras[e.id] ? 'border-primary shadow-sm ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                    data-testid={`extra-${e.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium" style={{ fontFamily: 'Outfit' }}>{e.name}</h4>
                      {extras[e.id] && <Badge className="bg-primary text-white text-xs">Agregado</Badge>}
                    </div>
                    <p className="text-primary font-bold mt-1">+ S/{e.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4 sticky top-20">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>Tu Ramo</h2>
            <Separator />

            {flowerCount > 0 ? (
              <div className="space-y-2 text-sm">
                {Object.entries(flowers).map(([id, qty]) => {
                  const f = BUILDER_FLOWERS.find(fl => fl.id === id);
                  return f ? (
                    <div key={id} className="flex justify-between">
                      <span>{f.name} x{qty}</span>
                      <span className="font-medium">S/{(f.price * qty).toFixed(2)}</span>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Selecciona flores para empezar</p>
            )}

            {style && (
              <>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>{BUILDER_STYLES.find(s => s.id === style)?.name}</span>
                  <span className="font-medium">S/{stylePrice.toFixed(2)}</span>
                </div>
              </>
            )}

            {Object.keys(extras).length > 0 && (
              <>
                <Separator />
                <div className="space-y-2 text-sm">
                  {Object.keys(extras).map(id => {
                    const e = BUILDER_EXTRAS.find(ex => ex.id === id);
                    return e ? (
                      <div key={id} className="flex justify-between">
                        <span>{e.name}</span>
                        <span className="font-medium">S/{e.price.toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </>
            )}

            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary" data-testid="builder-total">S/{grandTotal.toFixed(2)}</span>
            </div>

            <Button
              className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white gap-2 h-12"
              onClick={handleSendWhatsApp}
              disabled={flowerCount === 0}
              data-testid="builder-whatsapp-button"
            >
              <MessageCircle className="h-5 w-5" /> Enviar por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
