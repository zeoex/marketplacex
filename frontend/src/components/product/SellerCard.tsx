'use client';

import Link from 'next/link';
import { Star, Shield, Package, UserPlus, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface Seller {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  reputationScore: number;
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
  const isOwnProduct = user?.id === seller.id;

  const memberSince = seller.createdAt
    ? new Date(seller.createdAt).getFullYear()
    : null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Seller</h3>

      <div className="flex items-center gap-3">
        <Link href={`/users/${seller.username ?? seller.id}`}>
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 overflow-hidden shrink-0 border-2 border-white dark:border-slate-700 shadow-sm">
            {seller.avatarUrl ? (
              <img src={seller.avatarUrl} alt={seller.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-600 font-bold text-lg">
                {seller.name[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/users/${seller.username ?? seller.id}`}
              className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 transition-colors"
            >
              {seller.name}
            </Link>
            {seller.isVerified && (
              <Shield className="w-4 h-4 text-blue-500 shrink-0" aria-label="Verified seller" />
            )}
          </div>
          {seller.username && (
            <p className="text-xs text-slate-400">@{seller.username}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {seller.reputationScore > 0 ? seller.reputationScore.toFixed(1) : '—'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Rating</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{seller.totalSales ?? 0}</span>
          <p className="text-xs text-slate-500 mt-0.5">Sales</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{seller._count?.products ?? 0}</span>
          <p className="text-xs text-slate-500 mt-0.5">Listings</p>
        </div>
      </div>

      {memberSince && (
        <p className="text-xs text-slate-400 text-center">Member since {memberSince}</p>
      )}

      {!isOwnProduct && (
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`/messages?sellerId=${seller.id}&productId=${productId}`}
            className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </a>
          <Link
            href={`/users/${seller.username ?? seller.id}`}
            className="flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Package className="w-4 h-4" />
            All listings
          </Link>
        </div>
      )}
    </div>
  );
}
