import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CouponsManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [settings, setSettings] = useState({ coupons_enabled: false });
  const [showDialog, setShowDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [couponsRes, settingsRes] = await Promise.all([
        axios.get(`${API}/coupons`),
        axios.get(`${API}/settings`),
      ]);
      setCoupons(couponsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    }
  };

  const handleToggleCoupons = async (enabled) => {
    try {
      await axios.put(`${API}/settings`, {
        id: 'global_settings',
        coupons_enabled: enabled,
      });
      setSettings({ ...settings, coupons_enabled: enabled });
      toast.success(`Cupones ${enabled ? 'activados' : 'desactivados'}`);
    } catch (error) {
      toast.error('Error al actualizar configuración');
      console.error(error);
    }
  };

  const handleCouponChange = (e) => {
    const { name, value } = e.target;
    setCouponForm(prev => ({
      ...prev,
      [name]: name === 'discount_value' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveCoupon = async () => {
    if (!couponForm.code || !couponForm.discount_value) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      if (editingCoupon) {
        await axios.put(`${API}/coupons/${editingCoupon.id}`, couponForm);
        toast.success('Cupón actualizado');
      } else {
        await axios.post(`${API}/coupons`, couponForm);
        toast.success('Cupón creado');
      }
      setShowDialog(false);
      setEditingCoupon(null);
      setCouponForm({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        active: true,
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar cupón');
      console.error(error);
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      active: coupon.active,
    });
    setShowDialog(true);
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cupón?')) return;

    try {
      await axios.delete(`${API}/coupons/${id}`);
      toast.success('Cupón eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar cupón');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-accent p-6 rounded-xl border-2 border-primary/20 shadow-lg">
        <div className="flex items-center gap-4">
          <Tag className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">Sistema de Cupones</h3>
            <p className="text-sm text-muted-foreground">
              {settings.coupons_enabled 
                ? 'Los clientes pueden aplicar cupones en el checkout' 
                : 'Los cupones están desactivados para los clientes'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Desactivado</span>
          <Switch
            checked={settings.coupons_enabled}
            onCheckedChange={handleToggleCoupons}
            data-testid="coupons-global-switch"
          />
          <span className="text-sm font-medium">Activado</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gestión de Cupones</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCoupon(null);
              setCouponForm({
                code: '',
                discount_type: 'percentage',
                discount_value: '',
                active: true,
              });
            }} className="shadow-lg" data-testid="admin-add-coupon-button">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Cupón
            </Button>
          </DialogTrigger>
          <DialogContent className="shadow-2xl" data-testid="admin-coupon-dialog">
            <DialogHeader>
              <DialogTitle data-testid="admin-coupon-dialog-title">
                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="code">Código del Cupón</Label>
                <Input
                  id="code"
                  name="code"
                  value={couponForm.code}
                  onChange={handleCouponChange}
                  placeholder="Ej: VERANO2026"
                  className="uppercase"
                  data-testid="admin-coupon-code"
                />
              </div>
              <div>
                <Label htmlFor="discount_type">Tipo de Descuento</Label>
                <select
                  id="discount_type"
                  name="discount_type"
                  value={couponForm.discount_type}
                  onChange={handleCouponChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  data-testid="admin-coupon-type"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo (S/)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="discount_value">
                  Valor del Descuento {couponForm.discount_type === 'percentage' ? '(%)' : '(S/)'}
                </Label>
                <Input
                  id="discount_value"
                  name="discount_value"
                  type="number"
                  step="0.01"
                  value={couponForm.discount_value}
                  onChange={handleCouponChange}
                  placeholder={couponForm.discount_type === 'percentage' ? 'Ej: 20' : 'Ej: 50.00'}
                  data-testid="admin-coupon-value"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={couponForm.active}
                  onCheckedChange={(checked) => setCouponForm({...couponForm, active: checked})}
                  data-testid="admin-coupon-active"
                />
                <Label htmlFor="active">Cupón Activo</Label>
              </div>
              <Button onClick={handleSaveCoupon} className="w-full shadow-lg" data-testid="admin-coupon-save-button">
                {editingCoupon ? 'Actualizar' : 'Crear'} Cupón
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl shadow-lg overflow-hidden" data-testid="admin-coupons-table">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent">
              <TableHead className="font-bold">Código</TableHead>
              <TableHead className="font-bold">Tipo</TableHead>
              <TableHead className="font-bold">Valor</TableHead>
              <TableHead className="font-bold">Estado</TableHead>
              <TableHead className="font-bold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8" data-testid="admin-no-coupons">
                  No hay cupones creados
                </TableCell>
              </TableRow>
            ) : (
              coupons.map(coupon => (
                <TableRow key={coupon.id} data-testid={`admin-coupon-row-${coupon.id}`}>
                  <TableCell className="font-mono font-bold text-primary">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `S/ ${coupon.discount_value.toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {coupon.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEditCoupon(coupon)}
                        className="hover:bg-primary/10"
                        data-testid={`admin-edit-coupon-${coupon.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="hover:bg-destructive/10"
                        data-testid={`admin-delete-coupon-${coupon.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CouponsManager;