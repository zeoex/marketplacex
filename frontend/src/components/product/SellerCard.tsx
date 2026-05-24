'use client';

import Link from 'next/link';
import { Star, Shield, Package, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface Seller {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  reputationScore?: number;
  totalSales?: number;
  createdAt?: string;
  isVerified?: boolean;
  _count?: { products: number };
}

interface Props {
  seller: Seller;
  productId: string;
}

export function SellerCard({ seller, productId }: Props) {
  const { user } = useAuthStore();

  if (!seller) return null;

  const isOwnProduct = user?.id === seller.id;
  const memberSince  = seller.createdAt ? new Date(seller.createdAt).getFullYear() : null;
  const reputation   = typeof seller.reputationScore === 'number' ? seller.reputationScore : 0;
  const profileHref  = `/profile/${seller.username ?? seller.id}`;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4">
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vendedor</h3>

      {/* Avatar + nombre */}
      <div className="flex items-center gap-3">
        <Link href={profileHref}>
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 overflow-hidden shrink-0 border-2 border-white dark:border-slate-700 shadow-sm">
            {seller.avatarUrl ? (
              <img src={seller.avatarUrl} alt={seller.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-600 font-bold text-lg">
                {(seller.name ?? '?')[0].toUpperCase()}
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={profileHref} className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 transition-colors">
              {seller.name}
            </Link>
            {seller.isVerified && (
              <Shield className="w-4 h-4 text-blue-500 shrink-0" aria-label="Vendedor verificado" />
            )}
          </div>
          {seller.username && (
            <p className="text-xs text-slate-400">@{seller.username}</p>
          )}
          {memberSince && (
            <p className="text-xs text-slate-400">Miembro desde {memberSince}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
          <div className="flex items-center justify-center gap-0.5">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {reputation > 0 ? reputation.toFixed(1) : '—'}
            </span>
          </div>
          <p className="text-2xs text-slate-500 mt-0.5">Reputación</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{seller.totalSales ?? 0}</span>
          <p className="text-2xs text-slate-500 mt-0.5">Ventas</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{seller._count?.products ?? 0}</span>
          <p className="text-2xs text-slate-500 mt-0.5">Publicaciones</p>
        </div>
      </div>

      {/* Acciones */}
      {!isOwnProduct && (
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`/messages?sellerId=${seller.id}&productId=${productId}`}
            className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contactar
          </a>
          <Link
            href={profileHref}
            className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Package className="w-4 h-4" />
            Ver perfil
          </Link>
        </div>
      )}
    </div>
  );
}
