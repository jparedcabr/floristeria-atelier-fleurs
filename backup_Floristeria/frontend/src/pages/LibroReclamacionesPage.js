import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LibroReclamacionesPage() {
  const [form, setForm] = useState({ name: "", dni: "", email: "", phone: "", address: "", description: "", claim_type: "queja" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dni || !form.email || !form.phone || !form.description) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/complaints`, form);
      toast.success("Reclamacion enviada correctamente");
      setSubmitted(true);
    } catch {
      toast.error("Error al enviar la reclamacion");
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" data-testid="complaint-success">
        <FileText className="h-16 w-16 mx-auto text-primary mb-4" strokeWidth={1} />
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'Outfit' }}>Reclamacion Enviada</h1>
        <p className="text-muted-foreground mt-2">
          Hemos recibido tu reclamacion. Nos comunicaremos contigo lo antes posible al correo y/o telefono proporcionado.
        </p>
        <Button className="mt-6 rounded-full bg-primary hover:bg-primary/90 text-white" onClick={() => { setSubmitted(false); setForm({ name: "", dni: "", email: "", phone: "", address: "", description: "", claim_type: "queja" }); }} data-testid="new-complaint-button">
          Enviar otra reclamacion
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12" data-testid="libro-reclamaciones-page">
      <div className="text-center mb-8">
        <FileText className="h-10 w-10 mx-auto text-primary mb-3" strokeWidth={1.5} />
        <h1 className="text-3xl tracking-tight font-medium" style={{ fontFamily: 'Outfit' }}>
          Libro de Reclamaciones
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Conforme a lo establecido en el Codigo de Proteccion y Defensa del Consumidor
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input id="name" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Tu nombre completo" data-testid="complaint-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI / CE *</Label>
              <Input id="dni" value={form.dni} onChange={e => update("dni", e.target.value)} placeholder="12345678" data-testid="complaint-dni" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electronico *</Label>
              <Input id="email" type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="tu@email.com" data-testid="complaint-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono *</Label>
              <Input id="phone" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="922458758" data-testid="complaint-phone" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Direccion</Label>
            <Input id="address" value={form.address} onChange={e => update("address", e.target.value)} placeholder="Tu direccion (opcional)" data-testid="complaint-address" />
          </div>

          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select value={form.claim_type} onValueChange={v => update("claim_type", v)} data-testid="complaint-type-select">
              <SelectTrigger data-testid="complaint-type-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="queja">Queja</SelectItem>
                <SelectItem value="reclamo">Reclamo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detalle de la Reclamacion *</Label>
            <Textarea id="description" value={form.description} onChange={e => update("description", e.target.value)} placeholder="Describe tu queja o reclamo con el mayor detalle posible..." rows={5} data-testid="complaint-description" />
          </div>

          <Separator />

          <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary hover:bg-primary/90 text-white h-12" data-testid="complaint-submit">
            {loading ? "Enviando..." : "Enviar Reclamacion"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            La respuesta sera enviada al correo electronico proporcionado. Contacto: jungle.dev.jp@gmail.com
          </p>
        </form>
      </div>
    </div>
  );
}
