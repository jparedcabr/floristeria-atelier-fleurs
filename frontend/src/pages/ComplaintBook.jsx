import React, { useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ComplaintBook = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    document_type: 'DNI',
    document_number: '',
    phone: '',
    address: '',
    email: '',
    request_type: 'Reclamo',
    detail: '',
    requested_action: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.document_number || !formData.phone || 
        !formData.address || !formData.email || !formData.detail || !formData.requested_action) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/complaints`, formData);
      
      toast.success('Reclamación enviada exitosamente. Le responderemos en un plazo de 15 días hábiles.');
      setFormData({
        full_name: '',
        document_type: 'DNI',
        document_number: '',
        phone: '',
        address: '',
        email: '',
        request_type: 'Reclamo',
        detail: '',
        requested_action: '',
      });
    } catch (error) {
      toast.error('Error al enviar la reclamación');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" data-testid="complaint-book-page">
      <Header />

      <section className="py-20 bg-gradient-to-b from-white to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <img
              src="https://customer-assets.emergentagent.com/job_blooms-atelier/artifacts/iwvs4cxi_image.png"
              alt="Libro de Reclamaciones"
              className="w-48 h-auto mx-auto mb-6 drop-shadow-lg"
              data-testid="complaint-book-image"
            />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-4 font-bold" data-testid="complaint-title">
              Libro de Reclamaciones
            </h1>
            <p className="text-muted-foreground text-lg" data-testid="complaint-subtitle">
              Conforme a lo establecido en el Código de Protección y Defensa del Consumidor
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Sus datos personales serán tratados conforme a nuestra Política de Privacidad
            </p>
          </div>

          <Card className="p-8 shadow-2xl border-2 border-primary/20">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="complaint-form">
              <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                <h3 className="font-semibold text-lg mb-2">Datos del Consumidor</h3>
              </div>

              <div>
                <Label htmlFor="full_name" className="required">Nombres y Apellidos Completos *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  placeholder="Ingrese su nombre completo"
                  data-testid="complaint-input-fullname"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_type">Tipo de Documento *</Label>
                  <select
                    id="document_type"
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-white mt-1"
                    data-testid="complaint-input-doctype"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet de Extranjería</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="document_number">Número de Documento *</Label>
                  <Input
                    id="document_number"
                    name="document_number"
                    value={formData.document_number}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="Número"
                    data-testid="complaint-input-docnumber"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono / Celular *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="Ej: 922458758"
                    data-testid="complaint-input-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="correo@ejemplo.com"
                    data-testid="complaint-input-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección Completa *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  placeholder="Av/Calle, número, distrito, ciudad"
                  data-testid="complaint-input-address"
                />
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary mt-8">
                <h3 className="font-semibold text-lg mb-2">Detalle de la Reclamación o Queja</h3>
              </div>

              <div>
                <Label htmlFor="request_type">Tipo de Solicitud *</Label>
                <select
                  id="request_type"
                  name="request_type"
                  value={formData.request_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white mt-1"
                  data-testid="complaint-input-type"
                >
                  <option value="Reclamo">Reclamo (Disconformidad relacionada con productos o servicios)</option>
                  <option value="Queja">Queja (Disconformidad no relacionada con productos o servicios o malestar por la atención)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Reclamo:</strong> Disconformidad relacionada a los productos o servicios. 
                  <strong className="ml-2">Queja:</strong> Disconformidad no relacionada a los productos o servicios, o malestar o descontento respecto a la atención al público.
                </p>
              </div>

              <div>
                <Label htmlFor="detail">Detalle del Reclamo o Queja *</Label>
                <Textarea
                  id="detail"
                  name="detail"
                  value={formData.detail}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="mt-1"
                  placeholder="Describa de manera clara y detallada el motivo de su reclamo o queja"
                  data-testid="complaint-input-detail"
                />
              </div>

              <div>
                <Label htmlFor="requested_action">Pedido del Consumidor (Qué solicita) *</Label>
                <Textarea
                  id="requested_action"
                  name="requested_action"
                  value={formData.requested_action}
                  onChange={handleChange}
                  rows={3}
                  required
                  className="mt-1"
                  placeholder="Ej: Solicito la devolución del importe pagado, reposición del producto, etc."
                  data-testid="complaint-input-action"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-semibold mb-2">Importante:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</li>
                  <li>El proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles.</li>
                  <li>Conforme al Código de Protección y Defensa del Consumidor, el presente reclamo será registrado en el Libro de Reclamaciones.</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all" 
                disabled={loading} 
                data-testid="complaint-submit-button"
              >
                {loading ? 'Enviando...' : 'Enviar Reclamación'}
              </Button>
            </form>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Floristería Atelier Fleurs | jungle.dev.jp@gmail.com | WhatsApp: +51 922 458 758</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ComplaintBook;
