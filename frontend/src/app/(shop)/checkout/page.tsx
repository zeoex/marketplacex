'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { ShieldCheck, CreditCard, Truck } from 'lucide-react';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const addressSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(3),
  country: z.string().min(2),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const { items, total, clear } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'mercadopago'>('stripe');

  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { name: user?.name, email: user?.email },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (address: AddressForm) => {
      const payload = {
        email: address.email,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variantId: i.variantId })),
        shippingAddress: address,
      };

      if (paymentMethod === 'stripe') {
        const res = await api.payments.createStripeCheckout(payload) as any;
        const stripe = await stripePromise;
        await stripe!.redirectToCheckout({ sessionId: res.data.sessionId });
      } else if (paymentMethod === 'mercadopago') {
        const res = await api.payments.createMercadoPago(payload) as any;
        window.location.href = res.data.initPoint;
      }
    },
    onError: (err: any) => toast.error(err.message || 'Checkout failed'),
  });

  if (!items.length) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-xl font-semibold mb-4">Your cart is empty</p>
        <Link href="/products" className="btn-primary">Browse products</Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-xl font-semibold mb-4">Please log in to checkout</p>
        <Link href="/auth/login?redirect=/checkout" className="btn-primary">Log in</Link>
      </div>
    );
  }

  const platformFee = total * 0.05;
  const grandTotal = total + platformFee;

  return (
    <main className="container-app py-10">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit((d) => checkoutMutation.mutate(d))}>
            {/* Shipping address */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-600" /> Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <input {...register('name')} placeholder="Full name" className="input-field" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div className="col-span-2">
                  <input {...register('email')} type="email" placeholder="Email" className="input-field" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div className="col-span-2">
                  <input {...register('street')} placeholder="Street address" className="input-field" />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                </div>
                <div>
                  <input {...register('city')} placeholder="City" className="input-field" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <input {...register('state')} placeholder="State" className="input-field" />
                </div>
                <div>
                  <input {...register('zip')} placeholder="ZIP Code" className="input-field" />
                </div>
                <div>
                  <input {...register('country')} placeholder="Country" className="input-field" defaultValue="US" />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mt-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" /> Payment Method
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'stripe', label: 'Credit Card', icon: '💳' },
                  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                  { id: 'mercadopago', label: 'MercadoPago', icon: '💰' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      paymentMethod === m.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-2xl mb-1">{m.icon}</p>
                    <p className="text-xs font-medium">{m.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={checkoutMutation.isPending}
              className="btn-brand w-full py-4 text-lg mt-6"
            >
              {checkoutMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : `Pay ${formatCurrency(grandTotal, 'USD')}`}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>Secured by SSL encryption. We never store your card details.</span>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 truncate flex-1 mr-2">
                    {item.title} <span className="text-slate-400">×{item.quantity}</span>
                  </span>
                  <span className="font-medium shrink-0">{formatCurrency(item.price * item.quantity, item.currency)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatCurrency(total, 'USD')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Platform fee (5%)</span>
                <span>{formatCurrency(platformFee, 'USD')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-slate-100 dark:border-slate-700 pt-2">
                <span>Total</span>
                <span>{formatCurrency(grandTotal, 'USD')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
