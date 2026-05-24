export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { api } from '@/lib/api';
import { ChevronRight } from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  electronica: '💻',
  vehiculos: '🚗',
  inmuebles: '🏠',
  indumentaria: '👕',
  'hogar-y-jardin': '🛋️',
  deportes: '⚽',
  'libros-y-revistas': '📚',
  'juguetes-y-bebes': '🧸',
  servicios: '🔧',
  empleos: '💼',
};

export default async function CategoriesPage() {
  let categories: any[] = [];
  try {
    const res = await (api.categories.getAll() as any);
    categories = res?.data || [];
  } catch {
    categories = [];
  }

  const parents = categories.filter((c: any) => !c.parentId);
  const children = categories.filter((c: any) => c.parentId);

  return (
    <main className="container-app py-8">
      <h1 className="text-2xl font-bold mb-2">Todas las categorías</h1>
      <p className="text-slate-500 mb-8">Explorá publicaciones por categoría</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {parents.map((cat: any) => {
          const subs = children.filter((c: any) => c.parentId === cat.id);
          const icon = CATEGORY_ICONS[cat.slug] || '📦';
          return (
            <div key={cat.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <Link
                href={`/products?category=${cat.id}`}
                className="flex items-center gap-3 mb-3 group"
              >
                <span className="text-3xl">{icon}</span>
                <div className="flex-1">
                  <span className="font-semibold text-lg group-hover:text-primary-600 transition-colors">
                    {cat.name}
                  </span>
                  {cat._count?.products !== undefined && (
                    <p className="text-xs text-slate-400">{cat._count.products} publicaciones</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600" />
              </Link>
              {subs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {subs.map((sub: any) => (
                    <Link
                      key={sub.id}
                      href={`/products?category=${sub.id}`}
                      className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
