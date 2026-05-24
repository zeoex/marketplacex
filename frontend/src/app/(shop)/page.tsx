import { Suspense } from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesGrid } from '@/components/home/CategoriesGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { RecentProducts } from '@/components/home/RecentProducts';
import { TrustBadges } from '@/components/home/TrustBadges';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { ArrowRight } from 'lucide-react';

function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-brand rounded-full" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline underline-offset-2">
          Ver todas <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
  </div>
);

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Trust badges ── */}
      <TrustBadges />

      {/* ── Categories ── */}
      <section className="container-app py-10">
        <SectionTitle title="Explorá por categoría" href="/categories" />
        <CategoriesGrid />
      </section>

      {/* ── Featured ── */}
      <section className="bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800 py-10">
        <div className="container-app">
          <SectionTitle title="Publicaciones destacadas" href="/products?featured=true" />
          <Suspense fallback={<SkeletonGrid />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* ── Recent ── */}
      <section className="container-app py-10">
        <SectionTitle title="Últimas publicaciones" href="/products" />
        <Suspense fallback={<SkeletonGrid />}>
          <RecentProducts />
        </Suspense>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-14">
        <div className="container-app text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            ¿Tenés algo para vender?
          </h2>
          <p className="text-white/70 mb-7 text-base">
            Publicar es gratis y llega a miles de compradores en Argentina.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-brand/30">
            Publicar ahora — es gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
