'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, X, Plus } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  price: z.string().min(1, 'Ingresá un precio'),
  currency: z.string().default('ARS'),
  condition: z.string().min(1, 'Seleccioná la condición'),
  categoryId: z.string().min(1, 'Seleccioná una categoría'),
  location: z.string().min(2, 'Ingresá la ubicación'),
});

type FormData = z.infer<typeof schema>;

const CONDITIONS = [
  { value: 'NEW', label: 'Nuevo' },
  { value: 'LIKE_NEW', label: 'Como nuevo' },
  { value: 'GOOD', label: 'Buen estado' },
  { value: 'FAIR', label: 'Estado regular' },
  { value: 'POOR', label: 'Para repuesto/reparar' },
];

export default function NewProductPage() {
  const { user, hasHydrated } = useRequireAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll(),
    staleTime: Infinity,
  });

  const categories = (catData as any)?.data || [];

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'ARS', condition: 'GOOD' },
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      fd.append('status', 'ACTIVE');
      files.forEach((f) => fd.append('images', f));
      return api.products.create(fd);
    },
    onSuccess: (res: any) => {
      toast.success('¡Publicación creada con éxito!');
      const slug = res?.data?.slug || res?.slug;
      router.push(slug ? `/products/${slug}` : '/products/my');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Error al crear la publicación');
    },
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 8 - files.length);
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  if (!hasHydrated) return (
    <div className="container-app py-16 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  return (
    <main className="container-app py-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Publicar aviso</h1>
            <p className="text-sm text-slate-500">Completá los datos del artículo que querés vender</p>
          </div>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          {/* Fotos */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="font-semibold mb-4">Fotos <span className="text-slate-400 text-sm font-normal">(hasta 8)</span></h2>
            <div className="grid grid-cols-4 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {files.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-1 hover:border-primary-400 transition-colors text-slate-400"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Agregar</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
          </div>

          {/* Datos del artículo */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold">Datos del artículo</h2>

            <div>
              <label className="block text-sm font-medium mb-1.5">Título *</label>
              <input {...register('title')} placeholder="Ej: iPhone 13 128GB azul, impecable" className="input-field" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Categoría *</label>
              <select {...register('categoryId')} className="input-field">
                <option value="">Seleccioná una categoría</option>
                {categories.filter((c: any) => !c.parentId).map((cat: any) => (
                  <optgroup key={cat.id} label={cat.name}>
                    <option value={cat.id}>{cat.name} (general)</option>
                    {categories.filter((s: any) => s.parentId === cat.id).map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Descripción *</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describí el artículo: estado, características, motivo de venta..."
                className="input-field resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Condición *</label>
              <select {...register('condition')} className="input-field">
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>}
            </div>
          </div>

          {/* Precio */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold">Precio</h2>
            <div className="flex gap-3">
              <select {...register('currency')} className="input-field w-28">
                <option value="ARS">$ ARS</option>
                <option value="USD">U$D USD</option>
              </select>
              <input
                {...register('price')}
                type="number"
                min="0"
                step="any"
                placeholder="0"
                className="input-field flex-1"
              />
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>

          {/* Ubicación */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold">Ubicación</h2>
            <input
              {...register('location')}
              placeholder="Ej: Buenos Aires, CABA"
              className="input-field"
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-brand w-full py-4 text-base"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publicando...
              </span>
            ) : 'Publicar aviso gratis'}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
