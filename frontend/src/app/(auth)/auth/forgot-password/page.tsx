'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Ingresá un email válido'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.auth.forgotPassword(data.email),
    onSuccess: () => setSent(true),
    onError: () => toast.error('Hubo un error. Intentá de nuevo.'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                <span className="text-white font-black">M</span>
              </div>
              Market<span className="text-brand">Store</span>
            </Link>
            <h1 className="text-2xl font-bold">¿Olvidaste tu contraseña?</h1>
            <p className="text-slate-500 mt-1 text-sm">Te enviamos un enlace para restablecerla</p>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-semibold text-lg">¡Listo! Revisá tu email</p>
              <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                Si el correo está registrado, vas a recibir el enlace en los próximos minutos.
              </p>
              <Link href="/auth/login" className="btn-primary mt-6 inline-flex">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="vos@ejemplo.com"
                    className="input-field pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn-primary w-full py-3 text-base"
              >
                {mutation.isPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">
              ← Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
