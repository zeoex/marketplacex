'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, X, Pencil } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
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

export default function EditProductPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileRef = useRef<HTMLInputElement>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [keepImages, setKeepImages] = useState<{ url: string; id: string }[]>([]);

  useEffect(() => {
    if (!user) {
      toast.error('Necesitás iniciar sesión');
      router.push('/auth/login');
    }
  }, [user, router]);

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll(),
    staleTime: Infinity,
  });
  const categories = (catData as any)?.data || [];

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => api.products.getOne(id),
    enabled: !!id,
  });

  const product = (productData as any)?.data ?? (productData as any);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (product?.id) {
      reset({
        title: product.title,
        description: product.description,
        price: String(product.price),
        currency: product.currency || 'ARS',
        condition: product.condition,
        categoryId: product.categoryId,
        location: product.location || '',
      });
      setKeepImages((product.images || []).map((img: any) => ({ url: img.url, id: img.id })));
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      newFiles.forEach((f) => fd.append('images', f));
      return api.products.update(id, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        condition: formData.condition,
        location: formData.location,
      });
    },
    onSuccess: () => {
      toast.success('¡Publicación actualizada!');
      router.push('/products/my');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Error al actualizar');
    },
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 8 - keepImages.length - newFiles.length);
    setNewFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeKeepImage = (imgId: string) => {
    setKeepImages((prev) => prev.filter((img) => img.id !== imgId));
  };

  const removeNewFile = (i: number) => {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== i));
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  if (!user || isLoading) return (
    <div className="container-app py-8 max-w-2xl mx-auto">
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!product?.id) return (
    <div className="container-app py-16 text-center">
      <p className="text-slate-500">Publicación no encontrada.</p>
    </div>
  );

  const totalImages = keepImages.length + newFiles.length;

  return (
    <main className="container-app py-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Pencil className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Editar publicación</h1>
            <p className="text-sm text-slate-500">Modificá los datos del artículo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          {/* Fotos */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="font-semibold mb-4">Fotos <span className="text-slate-400 text-sm font-normal">(hasta 8)</span></h2>
            <div className="grid grid-cols-4 gap-3">
              {/* Existing images */}
              {keepImages.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeKeepImage(img.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* New images */}
              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewFile(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {totalImages < 8 && (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-1 hover:border-primary-400 transition-colors text-slate-400">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Agregar</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
          </div>

          {/* Datos */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold">Datos del artículo</h2>

            <div>
              <label className="block text-sm font-medium mb-1.5">Título *</label>
              <input {...register('title')} className="input-field" />
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
              <textarea {...register('description')} rows={4} className="input-field resize-none" />
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
              <input {...register('price')} type="number" min="0" step="any" placeholder="0" className="input-field flex-1" />
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>

          {/* Ubicación */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold">Ubicación</h2>
            <input {...register('location')} placeholder="Ej: Buenos Aires, CABA" className="input-field" />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.push('/products/my')}
              className="btn-outline flex-1 py-4 text-base">
              Cancelar
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn-brand flex-1 py-4 text-base">
              {mutation.isPending ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
