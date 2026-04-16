import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border mt-20" data-testid="footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div data-testid="footer-brand">
            <h3 className="text-2xl font-semibold mb-4">Floristería Atelier Fleurs</h3>
            <p className="text-muted-foreground">
              Flores y arreglos exclusivos para cada ocasión especial.
            </p>
          </div>

          {/* Links */}
          <div data-testid="footer-links">
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-home">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/arma-tu-ramo" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-custom">
                  Arma tu Ramo
                </Link>
              </li>
              <li>
                <Link to="/libro-reclamaciones" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-complaints">
                  Libro de Reclamaciones
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-admin">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div data-testid="footer-contact">
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="https://wa.me/51922458758" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" data-testid="footer-whatsapp">
                  +51 922 458 758
                </a>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:jungle.dev.jp@gmail.com" className="hover:text-primary transition-colors" data-testid="footer-email">
                  jungle.dev.jp@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
                <a href="https://www.tiktok.com/@floristeriaatelierfleurs" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" data-testid="footer-tiktok">
                  @floristeriaatelierfleurs
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground" data-testid="footer-copyright">
          <p>&copy; {new Date().getFullYear()} Floristería Atelier Fleurs. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
