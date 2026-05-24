'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Eye } from 'lucide-react';
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

interface ProductCardProps {
  product: Product;
  index?: number;
}

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nuevo', color: 'bg-green-100 text-green-700' },
  LIKE_NEW: { label: 'Como Nuevo', color: 'bg-blue-100 text-blue-700' },
  GOOD: { label: 'Buen Estado', color: 'bg-yellow-100 text-yellow-700' },
  FAIR: { label: 'Estado Regular', color: 'bg-orange-100 text-orange-700' },
  POOR: { label: 'Mal Estado', color: 'bg-red-100 text-red-700' },
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isFav, setIsFav] = useState(product.isFavorited ?? false);

  const toggleFavMutation = useMutation({
    mutationFn: () => api.favorites.toggle(product.id),
    onMutate: () => setIsFav(!isFav),
    onError: () => {
      setIsFav(!isFav);
      toast.error('Error al actualizar favoritos');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Iniciá sesión para guardar favoritos'); return; }
    toggleFavMutation.mutate();
  };

  const condition = CONDITION_LABELS[product.condition] || { label: product.condition, color: 'bg-slate-100 text-slate-600' };
  const imageUrl = product.images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/products/${product.slug}`} className="product-card group block">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Eye className="w-12 h-12" />
            </div>
          )}

          {/* Badge de condición */}
          <div className={`absolute top-2 left-2 badge text-xs ${condition.color}`}>
            {condition.label}
          </div>

          {/* Botón favorito */}
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm
                       rounded-full flex items-center justify-center shadow-sm transition-all
                       hover:scale-110 active:scale-95"
            aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
            />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.title}
          </h3>

          {product.location && (
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{product.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(product.price, product.currency)}
            </p>
            {product._count?.favorites ? (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Heart className="w-3 h-3" />
                <span>{product._count.favorites}</span>
              </div>
            ) : null}
          </div>

          {/* Vendedor */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50 dark:border-slate-700">
            <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs overflow-hidden shrink-0">
              {product.seller.avatarUrl ? (
                <img src={product.seller.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                product.seller.name[0]
              )}
            </div>
            <span className="text-xs text-slate-500 truncate">{product.seller.name}</span>
            {product.seller.reputationScore > 0 && (
              <div className="flex items-center gap-0.5 ml-auto">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-medium">{product.seller.reputationScore.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-1">{timeAgo(product.createdAt)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
