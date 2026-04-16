import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LogOut, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import CouponsManager from '@/components/admin/CouponsManager';
import BannerManager from '@/components/admin/BannerManager';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    image_url: '',
    stock: 100,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/categories`),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
    toast.success('Sesión cerrada');
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductForm(prev => ({
        ...prev,
        image_url: reader.result,
      }));
      toast.success('Imagen cargada');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.category || !productForm.price) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, productForm);
        toast.success('Producto actualizado');
      } else {
        await axios.post(`${API}/products`, productForm);
        toast.success('Producto creado');
      }
      setShowProductDialog(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        image_url: '',
        stock: 100,
      });
      fetchData();
    } catch (error) {
      toast.error('Error al guardar producto');
      console.error(error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory || '',
      image_url: product.image_url,
      stock: product.stock,
    });
    setShowProductDialog(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await axios.delete(`${API}/products/${id}`);
      toast.success('Producto eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar producto');
      console.error(error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="admin-loading">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold" data-testid="admin-dashboard-title">Panel Administrativo</h1>
          <Button variant="outline" onClick={handleLogout} data-testid="admin-logout-button">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" data-testid="admin-tabs">
          <TabsList>
            <TabsTrigger value="products" data-testid="admin-tab-products">Productos</TabsTrigger>
            <TabsTrigger value="banner" data-testid="admin-tab-banner">Banner</TabsTrigger>
            <TabsTrigger value="coupons" data-testid="admin-tab-coupons">Cupones</TabsTrigger>
            <TabsTrigger value="categories" data-testid="admin-tab-categories">Categorías</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4" data-testid="admin-products-tab">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Productos</h2>
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      description: '',
                      price: '',
                      category: '',
                      subcategory: '',
                      image_url: '',
                      stock: 100,
                    });
                  }} data-testid="admin-add-product-button">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Producto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="admin-product-dialog">
                  <DialogHeader>
                    <DialogTitle data-testid="admin-product-dialog-title">
                      {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductChange}
                        data-testid="admin-product-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={productForm.description}
                        onChange={handleProductChange}
                        rows={3}
                        data-testid="admin-product-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Precio (S/)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={handleProductChange}
                          data-testid="admin-product-price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={handleProductChange}
                          data-testid="admin-product-stock"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <select
                        id="category"
                        name="category"
                        value={productForm.category}
                        onChange={handleProductChange}
                        className="w-full px-3 py-2 border border-border rounded-md"
                        data-testid="admin-product-category"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="subcategory">Subcategoría (opcional)</Label>
                      <Input
                        id="subcategory"
                        name="subcategory"
                        value={productForm.subcategory}
                        onChange={handleProductChange}
                        data-testid="admin-product-subcategory"
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">Imagen</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        data-testid="admin-product-image-upload"
                      />
                      {productForm.image_url && (
                        <img
                          src={productForm.image_url}
                          alt="Preview"
                          className="mt-2 w-32 h-32 object-cover rounded-lg"
                          data-testid="admin-product-image-preview"
                        />
                      )}
                    </div>
                    <Button onClick={handleSaveProduct} className="w-full" data-testid="admin-product-save-button">
                      {editingProduct ? 'Actualizar' : 'Crear'} Producto
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg" data-testid="admin-products-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground" data-testid="admin-no-products">
                        No hay productos
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map(product => (
                      <TableRow key={product.id} data-testid={`admin-product-row-${product.id}`}>
                        <TableCell>
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>S/ {product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                              data-testid={`admin-edit-product-${product.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleDeleteProduct(product.id)}
                              data-testid={`admin-delete-product-${product.id}`}
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
          </TabsContent>

          {/* Banner Tab */}
          <TabsContent value="banner" className="space-y-4" data-testid="admin-banner-tab">
            <BannerManager />
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-4" data-testid="admin-coupons-tab">
            <CouponsManager />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4" data-testid="admin-categories-tab">
            <h2 className="text-xl font-semibold">Categorías</h2>
            <div className="border rounded-lg" data-testid="admin-categories-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Slug</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map(category => (
                    <TableRow key={category.id} data-testid={`admin-category-row-${category.id}`}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
