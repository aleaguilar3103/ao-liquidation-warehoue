import Link from "next/link";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-brand to-brand-dark text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">LW</span>
              </div>
              <span className="text-lg font-bold">Liquidation Warehouse</span>
            </div>
            <p className="text-white/70 text-sm">
              Tu socio confiable en liquidación mayorista
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Navegación</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/70 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-white/70 hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-white/70 hover:text-white transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/mision-vision" className="text-white/70 hover:text-white transition-colors">
                  Misión y Visión
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-white/70 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-white/70">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+506 7191 0009</span>
              </li>
              <li className="flex items-center space-x-2 text-white/70">
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@aoliquidationwarehouse.com</span>
              </li>
              <li className="flex items-start space-x-2 text-white/70">
                <MapPin className="w-4 h-4 mt-0.5" />
                <div className="text-sm">
                  <div>San José Costa Rica</div>
                  <div>Los Angeles California</div>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contáctanos</h3>
            <a
              href="https://wa.link/pg0nbh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-white/60 text-sm">
          <p>&copy; {new Date().getFullYear()} Liquidation Warehouse. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}