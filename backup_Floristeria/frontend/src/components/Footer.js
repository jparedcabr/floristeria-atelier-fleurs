import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { BRAND_LOGO, CATEGORIES, EMAIL, WHATSAPP_NUMBER, TIKTOK_URL, WHATSAPP_URL } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-[hsl(330,10%,15%)] text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={BRAND_LOGO} alt="Atelier Fleurs" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'Outfit' }}>Atelier Fleurs</h3>
                <p className="text-xs text-white/50">Floristeria</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Creamos arreglos florales unicos con amor y dedicacion. Desde ramos tematicos K-Pop hasta clasicos romanticos.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase" style={{ fontFamily: 'Outfit' }}>Categorias</h4>
            <nav className="flex flex-col gap-2">
              {CATEGORIES.map(cat => (
                <Link key={cat.slug} to={`/categoria/${cat.slug}`} className="text-sm text-white/60 hover:text-primary transition-colors" data-testid={`footer-${cat.slug}`}>
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase" style={{ fontFamily: 'Outfit' }}>Enlaces</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/personalizar" className="text-sm text-white/60 hover:text-primary transition-colors" data-testid="footer-personalizar">Personalizar tu Ramo</Link>
              <Link to="/carrito" className="text-sm text-white/60 hover:text-primary transition-colors" data-testid="footer-carrito">Carrito</Link>
              <Link to="/libro-reclamaciones" className="text-sm text-white/60 hover:text-primary transition-colors" data-testid="footer-libro-reclamaciones">Libro de Reclamaciones</Link>
              <Link to="/admin" className="text-sm text-white/60 hover:text-primary transition-colors" data-testid="footer-admin">Admin</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase" style={{ fontFamily: 'Outfit' }}>Contacto</h4>
            <div className="flex flex-col gap-3">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/60 hover:text-green-400 transition-colors" data-testid="footer-whatsapp">
                <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {WHATSAPP_NUMBER}
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors" data-testid="footer-email">
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {EMAIL}
              </a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/60 hover:text-primary transition-colors" data-testid="footer-tiktok">
                <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                TikTok: @floristeriaatelierfleurs
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} Floristeria Atelier Fleurs. Todos los derechos reservados.</p>
          <Link to="/libro-reclamaciones" className="hover:text-primary transition-colors" data-testid="footer-libro-link">
            Libro de Reclamaciones
          </Link>
        </div>
      </div>
    </footer>
  );
}
