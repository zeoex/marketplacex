'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus, Package } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';

export default function MyProductsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-products'],
    queryFn: () => api.products.myProducts(),
    enabled: !!user,
  });

  const products = (data as any)?.data?.data || (data as any)?.data || [];

  if (!user) return null;

  return (
    <main className="container-app py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-brand" />
          <h1 className="text-2xl font-bold">Mis Publicaciones</h1>
        </div>
        <Link href="/products/new" className="btn-primary">
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
          <p className="text-slate-400 text-sm mb-6">
            ¡Empezá a vender hoy! Publicar es gratis.
          </p>
          <Link href="/products/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Publicar algo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product: any, i: number) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
