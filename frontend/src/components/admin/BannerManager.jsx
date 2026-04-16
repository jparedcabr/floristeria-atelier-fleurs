import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BannerManager = () => {
  const [settings, setSettings] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
      setPreview(response.data.hero_banner_url);
    } catch (error) {
      toast.error('Error al cargar configuración');
      console.error(error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await axios.post(`${API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newBannerUrl = uploadRes.data.url;
      setPreview(newBannerUrl);

      await axios.put(`${API}/settings`, {
        ...settings,
        hero_banner_url: newBannerUrl,
      });

      toast.success('Banner actualizado exitosamente');
      fetchSettings();
    } catch (error) {
      if (error.response?.status === 503) {
        toast.error('Cloudinary no está configurado. Por favor configura CLOUDINARY_URL en el backend.');
      } else {
        toast.error('Error al subir imagen');
      }
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Banner Principal (Hero)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Esta imagen se muestra en la sección principal de la página de inicio
          </p>
        </div>
      </div>

      <Card className="p-6 shadow-lg">
        <div className="space-y-6">
          <div>
            <Label className="text-base mb-3 block">Vista Previa Actual</Label>
            <div className="relative aspect-[21/9] rounded-xl overflow-hidden border-2 border-border shadow-md">
              {preview ? (
                <img
                  src={preview}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-accent">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="banner-upload" className="text-base mb-2 block">
              Cambiar Imagen del Banner
            </Label>
            <div className="flex gap-3 items-center">
              <Input
                id="banner-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="cursor-pointer"
                data-testid="banner-upload-input"
              />
              {uploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Recomendado: Imágenes de alta resolución (mínimo 1920x800px) en formato JPG o PNG.
            </p>
          </div>

          <div className="bg-accent/50 p-4 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Cloudinary
            </h4>
            <p className="text-xs text-muted-foreground">
              Las imágenes se almacenan en Cloudinary. Configura CLOUDINARY_URL en backend/.env
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BannerManager;