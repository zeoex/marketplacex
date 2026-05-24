import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const LINKS = {
  company: [
    { label: 'Sobre Nosotros', href: '/about' },
    { label: 'Empleos', href: '/careers' },
    { label: 'Prensa', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: 'Centro de Ayuda', href: '/help' },
    { label: 'Consejos de Seguridad', href: '/safety' },
    { label: 'Contactanos', href: '/contact' },
    { label: 'Reportar un Problema', href: '/report' },
  ],
  legal: [
    { label: 'Términos de Uso', href: '/terms' },
    { label: 'Política de Privacidad', href: '/privacy' },
    { label: 'Política de Cookies', href: '/cookies' },
    { label: 'Normas de la Comunidad', href: '/guidelines' },
  ],
};

const SOCIAL = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Marca */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-white font-bold text-xl">
              MarketPlaceX
            </Link>
            <p className="mt-3 text-sm text-slate-400 max-w-xs">
              La forma más rápida de comprar y vender en Argentina. Publicá gratis y contactate directamente con los vendedores.
            </p>
            <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>Argentina</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <Mail className="w-3 h-3" />
              <span>soporte@marketplacex.com</span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Empresa</h3>
            <ul className="space-y-2">
              {LINKS.company.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Soporte</h3>
            <ul className="space-y-2">
              {LINKS.support.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              {LINKS.legal.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container-app py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MarketPlaceX. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>Soporte 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
