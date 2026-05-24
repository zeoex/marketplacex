'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username required'),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: FormData) => api.auth.login(data),
    onSuccess: (res: any) => {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push('/');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Invalid credentials');
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                <span className="text-white font-black">M</span>
              </div>
              Market<span className="text-brand">PlaceX</span>
            </Link>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-slate-500 mt-1 text-sm">Sign in to your account</p>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Google', icon: '🇬', href: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google` },
              { label: 'Facebook', icon: '🔵', href: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/facebook` },
              { label: 'GitHub', icon: '⚫', href: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/github` },
            ].map((p) => (
              <a
                key={p.label}
                href={p.href}
                className="flex items-center justify-center gap-2 p-3 border border-slate-200 dark:border-slate-600
                           rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <span>{p.icon}</span>
                <span className="hidden sm:block">{p.label}</span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">or continue with email</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email or username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('emailOrUsername')}
                  type="text"
                  placeholder="your@email.com"
                  className="input-field pl-10"
                />
              </div>
              {errors.emailOrUsername && (
                <p className="text-red-500 text-xs mt-1">{errors.emailOrUsername.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-primary-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full py-3 text-base"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary-600 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
