'use client';

export const dynamic = 'force-dynamic';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Settings, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Ingresá tu nombre completo'),
  bio: z.string().max(200, 'Máximo 200 caracteres').optional(),
  location: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const { user, hasHydrated } = useRequireAuth();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      bio: (user as any)?.bio || '',
      location: (user as any)?.location || '',
      phone: (user as any)?.phone || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.users.updateProfile(data),
    onSuccess: (res: any) => {
      const updated = res?.data || res;
      const token = document.cookie.match(/access_token=([^;]+)/)?.[1] || '';
      setAuth({ ...user!, ...updated }, token, '');
      toast.success('¡Perfil actualizado correctamente!');
    },
    onError: () => toast.error('Error al actualizar el perfil'),
  });

  if (!hasHydrated) return (
    <div className="container-app py-16 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  return (
    <main className="container-app py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-brand" />
        <h1 className="text-2xl font-bold">Configuración</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-slate-500">@{user.username}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre completo</label>
            <input {...register('name')} className="input-field" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Bio <span className="text-slate-400 font-normal">(opcional)</span></label>
            <textarea {...register('bio')} rows={3} placeholder="Contá algo sobre vos..." className="input-field resize-none" />
            {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Ubicación <span className="text-slate-400 font-normal">(opcional)</span></label>
            <input {...register('location')} placeholder="Ej: Buenos Aires, CABA" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Teléfono <span className="text-slate-400 font-normal">(opcional)</span></label>
            <input {...register('phone')} type="tel" placeholder="Ej: +54 11 1234-5678" className="input-field" />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full py-3 mt-2"
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </main>
  );
}
