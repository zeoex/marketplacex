'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';

export default function FavoritesPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.favorites.getAll(),
    enabled: !!user,
  });

  const favorites = (data as any)?.data || [];

  if (!user) return null;

  return (
    <main className="container-app py-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-brand" />
        <h1 className="text-2xl font-bold">Mis Favoritos</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Todavía no tenés favoritos
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Guardá publicaciones que te interesen para verlas después
          </p>
          <a href="/products" className="btn-primary">
            Explorar publicaciones
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {favorites.map((fav: any, i: number) => (
            <ProductCard key={fav.id} product={fav.product} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
