export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { getInitials } from '@/lib/utils';
import { MapPin, Star, Package, Calendar } from 'lucide-react';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  let profile: any;

  try {
    profile = await (api.users.getProfile(username) as any);
    profile = profile?.data || profile;
  } catch {
    notFound();
  }

  const products = profile?.products || [];

  return (
    <main className="container-app py-8">
      {/* Perfil */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(profile?.name || username)
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile?.name}</h1>
            <p className="text-slate-500">@{profile?.username}</p>
            {profile?.location && (
              <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile?.bio && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-lg">{profile.bio}</p>
            )}
            <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span>{products.length} publicaciones</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{profile?.rating?.toFixed(1) || '—'} reputación</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Miembro desde {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publicaciones */}
      <h2 className="text-xl font-bold mb-4">Publicaciones de {profile?.name}</h2>
      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Este usuario no tiene publicaciones activas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product: any, i: number) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
