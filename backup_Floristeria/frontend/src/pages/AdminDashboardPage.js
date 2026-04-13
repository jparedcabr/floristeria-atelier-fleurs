import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Pencil, Trash2, Package, ShoppingBag, FileText } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboardPage() {
  const { user, logout, checkAuth, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [productModal, setProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const headers = useMemo(() => getAuthHeaders(), [getAuthHeaders]);

  const load = useCallback(async () => {
    try {
      const [p, o, c] = await Promise.all([
        axios.get(`${API}/admin/products`, { headers }),
        axios.get(`${API}/admin/orders`, { headers }),
        axios.get(`${API}/admin/complaints`, { headers }),
      ]);
      setProducts(p.data);
      setOrders(o.data);
      setComplaints(c.data);
    } catch (err) {
      console.error("Error loading admin data:", err);
      toast.error("Error cargando datos");
    }
  }, [headers]);

  useEffect(() => {
    checkAuth().then(ok => {
      if (!ok) { navigate("/admin", { replace: true }); return; }
      setChecking(false);
      load();
    });
  }, [checkAuth, navigate, load]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Eliminar este producto?")) return;
    try {
      await axios.delete(`${API}/admin/products/${id}`, { headers });
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Producto eliminado");
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Error eliminando");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(`${API}/admin/orders/${orderId}`, { status }, { headers });
      setOrders(prev => prev.map(o => o.id === orderId ? data : o));
      toast.success("Estado actualizado");
    } catch (err) {
      console.error("Error updating order:", err);
      toast.error("Error actualizando");
    }
  };

  const handleLogout = () => { logout(); navigate("/admin"); };

  if (checking) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-muted/30" data-testid="admin-dashboard">
      {/* Admin Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ fontFamily: 'Outfit' }}>Panel Admin</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2" data-testid="admin-logout">
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-2xl border p-4 text-center">
            <Package className="h-5 w-5 mx-auto text-primary mb-1" strokeWidth={1.5} />
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-xs text-muted-foreground">Productos</p>
          </div>
          <div className="bg-card rounded-2xl border p-4 text-center">
            <ShoppingBag className="h-5 w-5 mx-auto text-primary mb-1" strokeWidth={1.5} />
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Pedidos</p>
          </div>
          <div className="bg-card rounded-2xl border p-4 text-center">
            <FileText className="h-5 w-5 mx-auto text-primary mb-1" strokeWidth={1.5} />
            <p className="text-2xl font-bold">{complaints.length}</p>
            <p className="text-xs text-muted-foreground">Reclamaciones</p>
          </div>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="w-full grid grid-cols-3" data-testid="admin-tabs">
            <TabsTrigger value="products" data-testid="admin-tab-products">Productos</TabsTrigger>
            <TabsTrigger value="orders" data-testid="admin-tab-orders">Pedidos</TabsTrigger>
            <TabsTrigger value="complaints" data-testid="admin-tab-complaints">Reclamaciones</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>Productos ({products.length})</h2>
              <Button size="sm" className="rounded-full gap-1 bg-primary hover:bg-primary/90 text-white" onClick={() => { setEditProduct(null); setProductModal(true); }} data-testid="add-product-button">
                <Plus className="h-4 w-4" /> Agregar
              </Button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {products.map(p => (
                <div key={p.id} className="bg-card rounded-xl border p-3 flex items-center gap-3" data-testid={`admin-product-${p.id}`}>
                  <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category} / {p.subcategory}</p>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">S/{p.price?.toFixed(2)}</span>
                  <Badge variant={p.available ? "default" : "secondary"} className={`text-xs shrink-0 ${p.available ? "bg-green-100 text-green-700" : ""}`}>
                    {p.available ? "Activo" : "Inactivo"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setEditProduct(p); setProductModal(true); }} data-testid={`edit-product-${p.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleDeleteProduct(p.id)} data-testid={`delete-product-${p.id}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Pedidos ({orders.length})</h2>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hay pedidos aun</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {orders.map(o => (
                  <div key={o.id} className="bg-card rounded-xl border p-4" data-testid={`admin-order-${o.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{o.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{o.customer_phone} {o.customer_email && `| ${o.customer_email}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={o.status} onValueChange={(v) => handleUpdateOrderStatus(o.id, v)}>
                          <SelectTrigger className="h-8 w-32 text-xs" data-testid={`order-status-${o.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="confirmado">Confirmado</SelectItem>
                            <SelectItem value="en-proceso">En Proceso</SelectItem>
                            <SelectItem value="enviado">Enviado</SelectItem>
                            <SelectItem value="completado">Completado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      {o.items?.map((item) => (
                        <div key={item.product_id} className="flex justify-between">
                          <span>{item.product_name} x{item.quantity}</span>
                          <span>S/{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total</span>
                      <span className="text-primary">S/{o.total?.toFixed(2)}</span>
                    </div>
                    {o.notes && <p className="text-xs text-muted-foreground mt-1">Notas: {o.notes}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleString("es-PE")}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="mt-4">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Reclamaciones ({complaints.length})</h2>
            {complaints.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hay reclamaciones</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {complaints.map(c => (
                  <div key={c.id} className="bg-card rounded-xl border p-4" data-testid={`admin-complaint-${c.id}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">DNI: {c.dni} | {c.email} | {c.phone}</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">{c.claim_type}</Badge>
                    </div>
                    <p className="text-sm mt-2">{c.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(c.created_at).toLocaleString("es-PE")}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Modal */}
      <ProductModal
        open={productModal}
        onClose={() => setProductModal(false)}
        product={editProduct}
        headers={headers}
        onSaved={(p) => {
          if (editProduct) {
            setProducts(prev => prev.map(x => x.id === p.id ? p : x));
          } else {
            setProducts(prev => [p, ...prev]);
          }
          setProductModal(false);
        }}
      />
    </div>
  );
}

function ProductModal({ open, onClose, product, headers, onSaved }) {
  const allSubcategories = CATEGORIES.flatMap(c => c.subcategories.map(s => ({ ...s, category: c.slug, categoryName: c.name })));
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "", subcategory: "", image_url: "", featured: false, available: true, tags: ""
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        image_url: product.image_url || "",
        featured: product.featured || false,
        available: product.available !== false,
        tags: (product.tags || []).join(", "),
      });
    } else {
      setForm({ name: "", description: "", price: "", category: "", subcategory: "", image_url: "", featured: false, available: true, tags: "" });
    }
  }, [product, open]);

  const handleSubcategoryChange = (subSlug) => {
    const sub = allSubcategories.find(s => s.slug === subSlug);
    setForm(prev => ({ ...prev, subcategory: subSlug, category: sub?.category || prev.category }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      category: form.category,
      subcategory: form.subcategory,
      image_url: form.image_url,
      featured: form.featured,
      available: form.available,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    try {
      if (product) {
        const { data } = await axios.put(`${API}/admin/products/${product.id}`, body, { headers });
        onSaved(data);
        toast.success("Producto actualizado");
      } else {
        const { data } = await axios.post(`${API}/admin/products`, body, { headers });
        onSaved(data);
        toast.success("Producto creado");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Error guardando producto");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="product-modal">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>Completa los datos del producto</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} data-testid="modal-product-name" />
          </div>
          <div className="space-y-2">
            <Label>Descripcion</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} data-testid="modal-product-description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Precio (S/) *</Label>
              <Input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} data-testid="modal-product-price" />
            </div>
            <div className="space-y-2">
              <Label>Subcategoria *</Label>
              <Select value={form.subcategory} onValueChange={handleSubcategoryChange}>
                <SelectTrigger data-testid="modal-product-subcategory">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <div key={cat.slug}>
                      <p className="px-2 py-1 text-xs font-bold text-muted-foreground">{cat.name}</p>
                      {cat.subcategories.map(sub => (
                        <SelectItem key={sub.slug} value={sub.slug}>{sub.name}</SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>URL de Imagen</Label>
            <Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." data-testid="modal-product-image" />
          </div>
          <div className="space-y-2">
            <Label>Tags (separados por coma)</Label>
            <Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="rosa, romantico, premium" data-testid="modal-product-tags" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="rounded" data-testid="modal-product-featured" />
              Destacado
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} className="rounded" data-testid="modal-product-available" />
              Disponible
            </label>
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white" data-testid="modal-product-submit">
              {product ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
