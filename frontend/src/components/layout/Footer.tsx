import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const LINKS = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Safety Tips', href: '/safety' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Report a Problem', href: '/report' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Community Guidelines', href: '/guidelines' },
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
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-white font-bold text-xl">
              MarketPlaceX
            </Link>
            <p className="mt-3 text-sm text-slate-400 max-w-xs">
              The fastest way to buy and sell locally. List your items in minutes and reach thousands of buyers.
            </p>
            <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>Available worldwide</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <Mail className="w-3 h-3" />
              <span>support@marketplacex.com</span>
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

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
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

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Support</h3>
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
          <p>© {new Date().getFullYear()} MarketPlaceX. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>24/7 Customer Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
