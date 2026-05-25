import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="container-app py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="text-white font-bold">
            Market<span className="text-brand">Store</span>
          </span>
          <span className="text-slate-600 text-sm hidden sm:inline">— Argentina</span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            Contacto
          </Link>
        </div>

        <p className="text-xs text-slate-600">© {new Date().getFullYear()} MarketStore. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
