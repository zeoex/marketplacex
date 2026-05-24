'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, AtSign, ShieldCheck } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres').regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const registerMutation = useMutation({
    mutationFn: (data: Omit<FormData, 'confirmPassword'>) => api.auth.register(data),
    onSuccess: (res: any) => {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success('¡Cuenta creada! Verificá tu email para completar el registro.');
      router.push('/');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al crear la cuenta');
    },
  });

  const onSubmit = (data: FormData) => {
    const { confirmPassword, ...rest } = data;
    registerMutation.mutate(rest);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                <span className="text-white font-black">M</span>
              </div>
              Market<span className="text-brand">PlaceX</span>
            </Link>
            <h1 className="text-2xl font-bold">Creá tu cuenta</h1>
            <p className="text-slate-500 mt-1 text-sm">Unite a miles de compradores y vendedores en Argentina</p>
          </div>

          {/* Aviso de verificación */}
          <div className="flex items-start gap-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
            <p className="text-xs text-primary-700 dark:text-primary-300">
              Para publicar artículos y contactar vendedores necesitás verificar tu identidad después del registro.
            </p>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {['google','facebook','github'].map((p) => (
              <a key={p} href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/${p}`}
                className="flex items-center justify-center p-3 border border-slate-200 dark:border-slate-600
                           rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm capitalize font-medium">
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">o con email</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input {...register('name')} placeholder="Juan Pérez" className="input-field pl-10" />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Usuario</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input {...register('username')} placeholder="juan_perez" className="input-field pl-10" />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('email')} type="email" placeholder="vos@ejemplo.com" className="input-field pl-10" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('confirmPassword')} type={showPw ? 'text' : 'password'} placeholder="Repetí la contraseña" className="input-field pl-10" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={registerMutation.isPending} className="btn-primary w-full py-3 text-base">
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando cuenta...
                </span>
              ) : 'Crear cuenta'}
            </button>

            <p className="text-xs text-slate-400 text-center">
              Al registrarte aceptás nuestros{' '}
              <Link href="/terms" className="text-primary-600 hover:underline">Términos de Uso</Link>
              {' '}y la{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline">Política de Privacidad</Link>
            </p>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">Iniciá sesión</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
