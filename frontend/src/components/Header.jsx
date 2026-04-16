import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import CartDrawer from '@/components/CartDrawer';

const Header = () => {
  const { getItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = getItemCount();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'K-Pop & Temáticos', path: '/categoria/kpop-tematicos' },
    { name: 'Ocasiones Especiales', path: '/categoria/ocasiones-especiales' },
    { name: 'Tipos de Flor', path: '/categoria/tipos-flor' },
    { name: 'Arma tu Ramo', path: '/arma-tu-ramo' },
    { name: 'Plantas', path: '/categoria/plantas' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="header-logo-link">
            <img
              src="https://customer-assets.emergentagent.com/job_c6029fd1-cb7a-4727-ae82-df330720db74/artifacts/sjvk45p3_71b54425-c49d-44b8-bce0-81dc74d1d6a4.jpeg"
              alt="Floristería Atelier Fleurs"
              className="h-14 w-auto"
              data-testid="header-logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" data-testid="desktop-nav">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-text_main hover:text-primary transition-colors"
                data-testid={`nav-link-${link.path}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <CartDrawer>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                data-testid="cart-button"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    data-testid="cart-badge"
                  >
                    {itemCount}
                  </span>
                )}
              </Button>
            </CartDrawer>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" data-testid="mobile-menu-button">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]" data-testid="mobile-menu">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navLinks.map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-text_main hover:text-primary transition-colors"
                      data-testid={`mobile-nav-link-${link.path}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Link
                    to="/libro-reclamaciones"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-text_main hover:text-primary transition-colors"
                    data-testid="mobile-nav-link-complaints"
                  >
                    Libro de Reclamaciones
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
