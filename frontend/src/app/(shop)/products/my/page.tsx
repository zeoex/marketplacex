'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { api } from '@/lib/api';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

function ConfirmDialog({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="font-bold text-lg mb-2">¿Eliminar publicación?</h3>
        <p className="text-slate-500 text-sm mb-6">
          Vas a eliminar <span className="font-medium text-slate-700 dark:text-slate-200">"{title}"</span>. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-outline flex-1 py-2.5">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyProductsPage() {
  const { user, hasHydrated } = useRequireAuth();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-products', user?.id],
    queryFn: () => api.products.myProducts(),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: () => {
      toast.success('Publicación eliminada');
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      setConfirmDelete(null);
    },
    onError: () => {
      toast.error('No se pudo eliminar');
      setConfirmDelete(null);
    },
  });

  const products = (data as any)?.data?.data ?? (data as any)?.data ?? [];

  if (!hasHydrated) return (
    <div className="container-app py-16 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  return (
    <main className="container-app py-8">
      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete.title}
          onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-brand" />
          <h1 className="text-2xl font-bold">Mis Publicaciones</h1>
        </div>
        <Link href="/products/new" className="btn-brand flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="w-4 h-4" />
          Nueva publicación
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
            No publicaste nada todavía
          </p>
          <p className="text-slate-400 text-sm mb-6">¡Empezá a vender hoy! Publicar es gratis.</p>
          <Link href="/products/new" className="btn-brand inline-flex items-center gap-2 px-6 py-3">
            <Plus className="w-4 h-4" />
            Publicar algo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product: any) => {
            const imageUrl = product.images?.[0]?.url;
            return (
              <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-card group">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-700">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={product.title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" unoptimized={imageUrl.startsWith('data:')} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  {/* Status badge */}
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    product.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                    product.status === 'PAUSED' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {product.status === 'ACTIVE' ? 'Activa' : product.status === 'PAUSED' ? 'Pausada' : product.status}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 text-sm leading-snug mb-1">
                    {product.title}
                  </h3>
                  <p className="text-lg font-black text-slate-900 dark:text-white mb-3">
                    {formatCurrency(product.price, product.currency)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium bg-primary-50 hover:bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 dark:text-primary-400 rounded-xl transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </Link>
                    <button
                      onClick={() => setConfirmDelete({ id: product.id, title: product.title })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
