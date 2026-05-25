'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Send, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ProductInfo } from './ProductInfo';
import { SellerCard } from './SellerCard';

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
  seller: Seller;
}

function ContactDialog({ seller, productId, onClose }: { seller: Seller; productId: string; onClose: () => void }) {
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
      toast.error(err?.response?.data?.message || err?.message || 'No se pudo enviar la solicitud');
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
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
          className="input-field resize-none text-sm mb-1"
          maxLength={500}
        />
        <p className="text-xs text-slate-400 text-right mb-4">{msg.length}/500</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 py-2.5">Cancelar</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn-brand flex-1 py-2.5 flex items-center justify-center gap-2"
          >
            {mutation.isPending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send className="w-4 h-4" />}
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailsClient({ product }: { product: Product }) {
  const { user } = useAuthStore();
  const [showDialog, setShowDialog] = useState(false);

  const isOwner = !!user && user.id === product.seller?.id;

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
        <ContactDialog seller={product.seller} productId={product.id} onClose={() => setShowDialog(false)} />
      )}

      <div className="space-y-6">
        {isOwner && (
          <Link
            href={`/products/${product.id}/edit`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-semibold text-sm transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar publicación
          </Link>
        )}

        <ProductInfo product={product} onContact={isOwner ? undefined : handleContact} />
        <SellerCard seller={product.seller} productId={product.id} onContact={isOwner ? undefined : handleContact} />
      </div>
    </>
  );
}
