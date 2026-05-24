import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

const BADGES = [
  {
    icon: ShieldCheck,
    title: 'Buyer Protection',
    desc: 'Every purchase is covered by our guarantee',
    color: 'text-green-600',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    desc: 'Same-day local pickup available',
    color: 'text-blue-600',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: '30-day return policy on all items',
    color: 'text-purple-600',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    desc: 'Multiple secure payment options',
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
