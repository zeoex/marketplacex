'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const CAT_META: Record<string, { emoji: string; color: string }> = {
  electronica:       { emoji: '💻', color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30' },
  vehiculos:         { emoji: '🚗', color: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700' },
  inmuebles:         { emoji: '🏠', color: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30' },
  indumentaria:      { emoji: '👗', color: 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/30' },
  'hogar-y-jardin':  { emoji: '🛋️', color: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30' },
  deportes:          { emoji: '⚽', color: 'bg-lime-50 hover:bg-lime-100 dark:bg-lime-900/20 dark:hover:bg-lime-900/30' },
  'libros-y-revistas':{ emoji: '📚', color: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30' },
  'juguetes-y-bebes':{ emoji: '🧸', color: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30' },
  servicios:         { emoji: '🔧', color: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700' },
  empleos:           { emoji: '💼', color: 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/30' },
};

const DEFAULT_COLORS = [
  'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20',
  'bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20',
  'bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20',
];
const DEFAULT_EMOJIS = ['📦', '🎁', '✨', '🌟'];

interface Category { id: string; name: string; slug: string; _count?: { products: number } }

export function CategoriesGrid() {
  const { data, isLoading } = useQuery<any>({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const all: Category[] = (data as any)?.data ?? [];
  const parents = all.filter((c) => !(c as any).parentId).slice(0, 10);

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2 md:gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton flex flex-col items-center gap-2 p-3 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-slate-200/60" />
            <div className="h-2.5 w-12 rounded bg-slate-200/60" />
          </div>
        ))}
      </div>
    );
  }

  if (!parents.length) return null;

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2 md:gap-3">
      {parents.map((cat, i) => {
        const meta  = CAT_META[cat.slug];
        const emoji = meta?.emoji ?? DEFAULT_EMOJIS[i % DEFAULT_EMOJIS.length];
        const color = meta?.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
        return (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className={`${color} flex flex-col items-center gap-2 p-3 rounded-2xl transition-colors group cursor-pointer`}
          >
            <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-150">{emoji}</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-center leading-tight line-clamp-2">
              {cat.name}
            </span>
            {cat._count?.products ? (
              <span className="text-2xs text-slate-400 dark:text-slate-500">{cat._count.products.toLocaleString()}</span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
