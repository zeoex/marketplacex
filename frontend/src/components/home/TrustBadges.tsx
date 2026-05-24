import { ShieldCheck, MessageCircle, Star, Zap } from 'lucide-react';

const BADGES = [
  { icon: ShieldCheck,   title: 'Usuarios verificados',    desc: 'Identidad validada para publicar',       color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' },
  { icon: MessageCircle, title: 'Contacto directo',        desc: 'Sin intermediarios ni comisiones',       color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' },
  { icon: Star,          title: 'Sistema de reputación',   desc: 'Calificaciones reales de la comunidad',  color: 'bg-amber-50 text-amber-500 dark:bg-amber-900/30' },
  { icon: Zap,           title: 'Publicar es gratis',      desc: 'Sin cargo por publicar ni contactar',    color: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' },
];

export function TrustBadges() {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="container-app py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {BADGES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-3">
              <div className={`${color} p-2 rounded-xl shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5 hidden sm:block">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
