'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'views-desc', label: 'Más vistos' },
];

const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];

export function ProductsContent() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    location: searchParams.get('location') || '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 24,
  });

  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.products.getAll(cleanedFilters),
    placeholderData: (prev) => prev,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll(),
    staleTime: Infinity,
  });

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', categoryId: '', minPrice: '', maxPrice: '', condition: '', location: '', sortBy: 'createdAt', order: 'desc', page: 1, limit: 24 });
  };

  const products = (data as any)?.data?.data || [];
  const meta = (data as any)?.data?.meta || {};
  const catList = (categories as any)?.data || [];
  const activeFiltersCount = [filters.categoryId, filters.minPrice, filters.maxPrice, filters.condition, filters.location].filter(Boolean).length;

  return (
    <main className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">
            {filters.search ? `Resultados para "${filters.search}"` : 'Explorar publicaciones'}
          </h1>
          {meta.total !== undefined && (
            <p className="text-sm text-slate-500 mt-0.5">{meta.total.toLocaleString()} publicaciones</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split('-');
              updateFilter('sortBy', sortBy);
              updateFilter('order', order);
            }}
            className="input-field py-2 text-sm w-auto"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-outline py-2 px-4 text-sm flex items-center gap-2 ${showFilters ? 'border-primary-500' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <div className="hidden md:flex border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'hover:bg-slate-50'}`} aria-label="Grid view">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'hover:bg-slate-50'}`} aria-label="List view">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {showFilters && (
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-64 shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Filtros</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Limpiar
                  </button>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Categoría</h4>
                <div className="space-y-1">
                  {catList.filter((c: any) => !c.parentId).map((cat: any) => (
                    <button key={cat.id} onClick={() => updateFilter('categoryId', filters.categoryId === cat.id ? '' : cat.id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filters.categoryId === cat.id ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Rango de precio</h4>
                <div className="flex gap-2">
                  <input type="number" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} placeholder="Mín" className="input-field py-2 text-sm w-1/2" />
                  <input type="number" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} placeholder="Máx" className="input-field py-2 text-sm w-1/2" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Condición</h4>
                <div className="space-y-1">
                  {CONDITIONS.map((c) => (
                    <button key={c} onClick={() => updateFilter('condition', filters.condition === c ? '' : c)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filters.condition === c ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Ubicación</h4>
                <input type="text" value={filters.location} onChange={(e) => updateFilter('location', e.target.value)} placeholder="Ciudad, provincia..." className="input-field py-2 text-sm" />
              </div>
            </div>
          </motion.aside>
        )}

        <div className="flex-1">
          {isLoading ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">No se encontraron publicaciones</p>
              <p className="text-slate-400 text-sm">Probá ajustando los filtros</p>
              {activeFiltersCount > 0 && <button onClick={clearFilters} className="btn-primary mt-4">Limpiar filtros</button>}
            </div>
          ) : (
            <>
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {products.map((product: any, i: number) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
              {meta.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => updateFilter('page', p)}
                      className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${filters.page === p ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 hover:border-primary-300'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
