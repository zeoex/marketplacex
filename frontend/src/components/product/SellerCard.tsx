'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Shield, Package, MessageCircle, X, Send } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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

function RequestDialog({ seller, productId, onClose }: { seller: Seller; productId: string; onClose: () => void }) {
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () =>
      api.messages.sendRequest({ sellerId: seller.id, productId, requestMessage: msg }),
    onSuccess: () => {
      toast.success('Solicitud enviada. El vendedor la recibirá en su buzón.');
      onClose();
      router.push('/messages');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'No se pudo enviar la solicitud');
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Contactar a {seller.name}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Escribí un mensaje presentándote y consultando sobre el artículo. El vendedor recibirá tu solicitud y decidirá aceptarla.
        </p>

        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={4}
          placeholder="Hola, me interesa tu publicación. ¿Sigue disponible?"
          className="input-field resize-none text-sm mb-4"
          maxLength={500}
        />
        <p className="text-xs text-slate-400 text-right mb-4">{msg.length}/500</p>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 py-2.5">
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn-brand flex-1 py-2.5 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}

export function SellerCard({ seller, productId }: Props) {
  const { user } = useAuthStore();
  const [showDialog, setShowDialog] = useState(false);

  if (!seller) return null;

  const isOwnProduct  = user?.id === seller.id;
  const memberSince   = seller.createdAt ? new Date(seller.createdAt).getFullYear() : null;
  const reputation    = typeof seller.reputationScore === 'number' ? seller.reputationScore : 0;
  const profileHref   = `/profile/${seller.username ?? seller.id}`;

  const handleContact = () => {
    if (!user) {
      toast.error('Iniciá sesión para contactar al vendedor');
      return;
    }
    setShowDialog(true);
  };

  return (
    <>
      {showDialog && (
        <RequestDialog seller={seller} productId={productId} onClose={() => setShowDialog(false)} />
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vendedor</h3>

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
            {seller.username && <p className="text-xs text-slate-400">@{seller.username}</p>}
            {memberSince && <p className="text-xs text-slate-400">Miembro desde {memberSince}</p>}
          </div>
        </div>

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

        {!isOwnProduct && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleContact}
              className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar
            </button>
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
    </>
  );
}
