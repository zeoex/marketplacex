'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Clock } from 'lucide-react';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  location?: string;
  createdAt: string;
  images: { url: string }[];
  seller: { name: string; avatarUrl?: string; reputationScore: number };
  _count?: { favorites: number };
  isFavorited?: boolean;
}

const CONDITION: Record<string, { label: string; cls: string }> = {
  NEW:      { label: 'Nuevo',        cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  LIKE_NEW: { label: 'Como nuevo',   cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400' },
  GOOD:     { label: 'Buen estado',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  FAIR:     { label: 'Regular',      cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
  POOR:     { label: 'Para repuesto',cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isFav, setIsFav] = useState(product.isFavorited ?? false);

  const toggleFav = useMutation({
    mutationFn: () => api.favorites.toggle(product.id),
    onMutate:   () => setIsFav((v) => !v),
    onError:    () => { setIsFav((v) => !v); toast.error('Error al actualizar favoritos'); },
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error('Iniciá sesión para guardar favoritos'); return; }
    toggleFav.mutate();
  };

  const cond     = CONDITION[product.condition] ?? { label: product.condition, cls: 'bg-slate-100 text-slate-600' };
  const imageUrl = product.images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.25 }}
    >
      <Link href={`/products/${product.slug}`} className="product-card group block">

        {/* ── Image ── */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
          )}

          {/* Condition badge */}
          <span className={`absolute top-2 left-2 badge text-2xs ${cond.cls}`}>
            {cond.label}
          </span>

          {/* Favorite */}
          <button
            onClick={handleFav}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md
                        transition-all duration-150 active:scale-90
                        ${isFav
                          ? 'bg-red-500 text-white'
                          : 'bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100'
                        }`}
            aria-label={isFav ? 'Quitar favorito' : 'Agregar a favoritos'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-3 pt-2.5">
          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.title}
          </h3>

          {/* Price */}
          <p className="mt-2 text-[1.05rem] font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(product.price, product.currency)}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 text-2xs text-slate-400">
            {product.location && (
              <span className="flex items-center gap-1 truncate min-w-0">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{product.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1 shrink-0 ml-auto">
              <Clock className="w-3 h-3" />
              {timeAgo(product.createdAt)}
            </span>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xs font-bold overflow-hidden shrink-0">
              {product.seller.avatarUrl
                ? <img src={product.seller.avatarUrl} alt="" className="w-full h-full object-cover" />
                : product.seller.name[0]?.toUpperCase()
              }
            </div>
            <span className="text-2xs text-slate-500 dark:text-slate-400 truncate flex-1">{product.seller.name}</span>
            {product._count?.favorites ? (
              <span className="flex items-center gap-0.5 text-2xs text-slate-400">
                <Heart className="w-2.5 h-2.5" />
                {product._count.favorites}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
