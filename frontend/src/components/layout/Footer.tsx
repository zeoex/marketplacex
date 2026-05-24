import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, ShieldCheck } from 'lucide-react';

const LINKS = {
  company: [
    { label: 'Sobre Nosotros',  href: '/about' },
    { label: 'Empleos',         href: '/careers' },
    { label: 'Blog',            href: '/blog' },
    { label: 'Prensa',          href: '/press' },
  ],
  support: [
    { label: 'Centro de Ayuda',      href: '/help' },
    { label: 'Consejos de Seguridad',href: '/safety' },
    { label: 'Contactanos',          href: '/contact' },
    { label: 'Reportar un problema', href: '/report' },
  ],
  legal: [
    { label: 'Términos de Uso',       href: '/terms' },
    { label: 'Privacidad',            href: '/privacy' },
    { label: 'Política de Cookies',   href: '/cookies' },
    { label: 'Normas de la Comunidad',href: '/guidelines' },
  ],
};

const SOCIAL = [
  { icon: Facebook,  href: '#', label: 'Facebook' },
  { icon: Twitter,   href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube,   href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="container-app pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-base">M</span>
              </div>
              <span className="text-white font-bold text-lg">
                Market<span className="text-brand">Store</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              La forma más rápida de comprar y vender en Argentina. Publicá gratis y contactate directamente con los vendedores.
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5" />
              <span>Argentina</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600">
              <Mail className="w-3.5 h-3.5" />
              <span>soporte@marketstore.com.ar</span>
            </div>

            {/* Social */}
            <div className="flex items-center gap-2 mt-5">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-8 h-8 bg-slate-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Empresa</h3>
            <ul className="space-y-2.5">
              {LINKS.company.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Soporte</h3>
            <ul className="space-y-2.5">
              {LINKS.support.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {LINKS.legal.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} MarketStore. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sitio seguro — usuarios verificados</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
