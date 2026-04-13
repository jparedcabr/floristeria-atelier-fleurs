import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { getCategoryBySlug, getSubcategoryBySlug, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import { ChevronRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CategoryPage() {
  const { categorySlug, subcategorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState(subcategorySlug || "all");

  const category = getCategoryBySlug(categorySlug);
  const subcategory = subcategorySlug ? getSubcategoryBySlug(categorySlug, subcategorySlug) : null;

  useEffect(() => {
    setActiveSubcategory(subcategorySlug || "all");
  }, [subcategorySlug]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categorySlug && categorySlug !== "todos") params.set("category", categorySlug);
    if (activeSubcategory && activeSubcategory !== "all") params.set("subcategory", activeSubcategory);
    if (searchQuery) params.set("search", searchQuery);
    axios.get(`${API}/products?${params.toString()}`)
      .then(r => setProducts(r.data))
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, [categorySlug, activeSubcategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const title = searchQuery
    ? `Resultados para "${searchQuery}"`
    : subcategory?.name || category?.name || "Todos los Productos";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12" data-testid="category-page">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6" data-testid="breadcrumb">
        <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
        {category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/categoria/${category.slug}`} className="hover:text-primary transition-colors">{category.name}</Link>
          </>
        )}
        {subcategory && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{subcategory.name}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl tracking-tight font-medium" style={{ fontFamily: 'Outfit' }} data-testid="category-title">
          {title}
        </h1>
        {category?.description && !subcategory && (
          <p className="text-muted-foreground mt-2">{category.description}</p>
        )}
      </div>

      {/* Subcategory Filters */}
      {category && category.subcategories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8" data-testid="subcategory-filters">
          <Badge
            variant={activeSubcategory === "all" ? "default" : "outline"}
            className={`cursor-pointer px-4 py-1.5 text-sm rounded-full transition-colors ${activeSubcategory === "all" ? "bg-primary text-white" : "hover:bg-accent"}`}
            onClick={() => setActiveSubcategory("all")}
            data-testid="filter-all"
          >
            Todos
          </Badge>
          {category.subcategories.map(sub => (
            <Badge
              key={sub.slug}
              variant={activeSubcategory === sub.slug ? "default" : "outline"}
              className={`cursor-pointer px-4 py-1.5 text-sm rounded-full transition-colors ${activeSubcategory === sub.slug ? "bg-primary text-white" : "hover:bg-accent"}`}
              onClick={() => setActiveSubcategory(sub.slug)}
              data-testid={`filter-${sub.slug}`}
            >
              {sub.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-muted rounded-2xl aspect-square animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 space-y-4" data-testid="no-products">
          <p className="text-muted-foreground text-lg">No se encontraron productos</p>
          <Link to="/">
            <Button variant="outline" className="rounded-full">Volver al inicio</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6" data-testid="products-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Other Categories */}
      {category && (
        <div className="mt-16">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Otras Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => c.slug !== categorySlug).map(c => (
              <Link key={c.slug} to={`/categoria/${c.slug}`}>
                <Button variant="outline" size="sm" className="rounded-full" data-testid={`other-cat-${c.slug}`}>
                  {c.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
