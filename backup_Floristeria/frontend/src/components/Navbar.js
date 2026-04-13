import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, Phone, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { BRAND_LOGO, CATEGORIES, WHATSAPP_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

export default function Navbar() {
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/categoria/todos?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header data-testid="navbar" className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="nav-logo">
            <img src={BRAND_LOGO} alt="Atelier Fleurs" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-semibold text-lg tracking-tight hidden sm:block" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Atelier Fleurs
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors" data-testid="nav-home">Inicio</Link>
            {CATEGORIES.slice(0, 4).map(cat => (
              <Link key={cat.slug} to={`/categoria/${cat.slug}`} className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors" data-testid={`nav-${cat.slug}`}>
                {cat.name}
              </Link>
            ))}
            <Link to="/personalizar" className="px-3 py-2 text-sm font-medium text-primary rounded-lg hover:bg-accent transition-colors" data-testid="nav-personalizar">
              Personalizar
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)} className="rounded-full" data-testid="nav-search-toggle">
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </Button>

            {/* WhatsApp */}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hidden sm:flex" data-testid="nav-whatsapp">
              <Button variant="ghost" size="icon" className="rounded-full text-green-600 hover:text-green-700 hover:bg-green-50">
                <Phone className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </a>

            {/* Cart */}
            <Link to="/carrito" className="relative" data-testid="nav-cart">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
              </Button>
              {count > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-white" data-testid="cart-count">
                  {count}
                </Badge>
              )}
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="mobile-menu-trigger">
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img src={BRAND_LOGO} alt="Atelier Fleurs" className="h-8 w-8 rounded-full object-cover" />
                    Atelier Fleurs
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6">
                  <Link to="/" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors" data-testid="mobile-nav-home">Inicio</Link>
                  {CATEGORIES.map(cat => (
                    <Link key={cat.slug} to={`/categoria/${cat.slug}`} onClick={() => setMobileOpen(false)} className="px-3 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors" data-testid={`mobile-nav-${cat.slug}`}>
                      {cat.name}
                    </Link>
                  ))}
                  <Link to="/personalizar" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-base font-medium text-primary rounded-lg hover:bg-accent transition-colors" data-testid="mobile-nav-personalizar">
                    Personalizar tu Ramo
                  </Link>
                  <Link to="/carrito" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors" data-testid="mobile-nav-cart">
                    Carrito {count > 0 && `(${count})`}
                  </Link>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="px-3 py-3 text-base font-medium text-green-600 rounded-lg hover:bg-green-50 transition-colors" data-testid="mobile-nav-whatsapp">
                    WhatsApp
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-3 animate-fade-in">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Buscar flores, ramos, peluches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                data-testid="search-input"
                autoFocus
              />
              <Button type="submit" size="sm" data-testid="search-submit">Buscar</Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
