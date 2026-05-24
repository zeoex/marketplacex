'use client';

import { useState } from 'react';
import { ShoppingCart, MessageCircle, Share2, Flag, Tag, Package, Truck, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  condition: string;
  delivery?: string;
  location?: string;
  stock: number;
  status: string;
  tags?: { name: string }[];
  variants?: { id: string; name: string; value: string; price?: number; stock?: number }[];
}

const CONDITION_MAP: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
};

const DELIVERY_MAP: Record<string, string> = {
  SHIPPING: 'Shipping only',
  LOCAL_PICKUP: 'Local pickup only',
  BOTH: 'Shipping or local pickup',
};

interface Props { product: Product }

export function ProductInfo({ product }: Props) {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const [qty, setQty] = useState(1);

  const handleAddToCart = () => {
    addItem(product as any, qty);
    toast.success(`Added ${qty} × "${product.title}" to cart`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.title, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const isSold = product.status === 'SOLD';
  const isOutOfStock = product.stock < 1;
  const disabled = isSold || isOutOfStock;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
          {product.title}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
            {CONDITION_MAP[product.condition] ?? product.condition}
          </span>
          {isSold && (
            <span className="badge bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full">Sold</span>
          )}
          {isOutOfStock && !isSold && (
            <span className="badge bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-full">Out of stock</span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">
          {formatCurrency(product.price, product.currency)}
        </span>
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">
          {product.description}
        </p>
      )}

      {/* Delivery & Location */}
      <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
        {product.delivery && (
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 shrink-0" />
            <span>{DELIVERY_MAP[product.delivery] ?? product.delivery}</span>
          </div>
        )}
        {product.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{product.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 shrink-0" />
          <span>{product.stock} available</span>
        </div>
      </div>

      {/* Qty + Add to cart */}
      {!disabled && (
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-9 h-10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-lg"
            >−</button>
            <span className="w-10 text-center font-medium text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              className="w-9 h-10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-lg"
            >+</button>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 btn-primary flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-2">
        <a
          href={`/messages?product=${product.id}`}
          className="flex-1 btn-secondary flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700"
        >
          <MessageCircle className="w-4 h-4" />
          Contact Seller
        </a>
        <button
          onClick={handleShare}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
        </button>
        <a
          href={`/report?productId=${product.id}`}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Report listing"
        >
          <Flag className="w-4 h-4 text-slate-500" />
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
              <Tag className="w-3 h-3" />
              {tag.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
