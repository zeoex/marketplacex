'use client';

import { MessageCircle, Share2, Flag, Package, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  condition: string;
  location?: string;
  stock: number;
  status: string;
  tags?: { name: string }[];
}

const CONDITION_MAP: Record<string, string> = {
  NEW: 'Nuevo',
  LIKE_NEW: 'Como Nuevo',
  GOOD: 'Buen Estado',
  FAIR: 'Estado Regular',
  POOR: 'Mal Estado',
};

interface Props { product: Product }

export function ProductInfo({ product }: Props) {
  const { user } = useAuthStore();
  const router = useRouter();

  const handleContact = () => {
    if (!user) {
      toast.error('Necesitás registrarte para contactar al vendedor');
      router.push('/auth/register');
      return;
    }
    router.push(`/messages?product=${product.id}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.title, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const isSold = product.status === 'SOLD';
  const isOutOfStock = product.stock < 1;

  return (
    <div className="space-y-5">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
          {product.title}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
            {CONDITION_MAP[product.condition] ?? product.condition}
          </span>
          {isSold && (
            <span className="badge bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full">Vendido</span>
          )}
          {isOutOfStock && !isSold && (
            <span className="badge bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-full">Sin stock</span>
          )}
        </div>
      </div>

      {/* Precio */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">
          {formatCurrency(product.price, product.currency)}
        </span>
      </div>

      {/* Descripción */}
      {product.description && (
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">
          {product.description}
        </p>
      )}

      {/* Ubicación y stock */}
      <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
        {product.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{product.location}</span>
          </div>
        )}
        {!isSold && (
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 shrink-0" />
            <span>{product.stock} disponible{product.stock !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* CTA principal — Contactar vendedor */}
      {!isSold && (
        <button
          onClick={handleContact}
          className="w-full btn-primary flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold"
        >
          <MessageCircle className="w-5 h-5" />
          Contactar vendedor
        </button>
      )}

      {/* Aviso si no está registrado */}
      {!user && (
        <p className="text-xs text-slate-500 text-center">
          Necesitás{' '}
          <a href="/auth/register" className="text-primary-600 hover:underline font-medium">
            registrarte
          </a>
          {' '}e iniciar sesión para poder contactar al vendedor.
        </p>
      )}

      {/* Acciones secundarias */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-slate-200
                     dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          Compartir
        </button>
        <a
          href={`/report?productId=${product.id}`}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200
                     dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
          aria-label="Denunciar publicación"
        >
          <Flag className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline text-slate-500">Denunciar</span>
        </a>
      </div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {product.tags.map((tag) => (
            <a
              key={tag.name}
              href={`/products?search=${encodeURIComponent(tag.name)}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800
                         text-xs text-slate-600 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              {tag.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
