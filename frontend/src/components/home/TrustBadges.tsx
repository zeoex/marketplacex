import { ShieldCheck, MessageCircle, Star, Gift } from 'lucide-react';

const BADGES = [
  {
    icon: ShieldCheck,
    title: 'Usuarios Verificados',
    desc: 'Solo usuarios con identidad validada pueden publicar',
    color: 'text-green-600',
  },
  {
    icon: MessageCircle,
    title: 'Contacto Directo',
    desc: 'Hablá directamente con el vendedor sin intermediarios',
    color: 'text-blue-600',
  },
  {
    icon: Star,
    title: 'Sistema de Reputación',
    desc: 'Calificaciones reales de compradores y vendedores',
    color: 'text-yellow-500',
  },
  {
    icon: Gift,
    title: '100% Gratuito',
    desc: 'Publicar y contactar vendedores es completamente gratis',
    color: 'text-primary-600',
  },
];

export function TrustBadges() {
  return (
    <div className="border-y border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="container-app py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-3 py-2">
              <div className={`shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                <p className="text-xs text-slate-500 hidden sm:block">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
