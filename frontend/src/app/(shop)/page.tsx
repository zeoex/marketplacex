import { Suspense } from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesGrid } from '@/components/home/CategoriesGrid';
import { RecentProducts } from '@/components/home/RecentProducts';
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
      <HeroSection />

      <section className="container-app py-10">
        <SectionTitle title="Explorá por categoría" href="/categories" />
        <CategoriesGrid />
      </section>

      <section className="container-app py-6 pb-14">
        <SectionTitle title="Últimas publicaciones" href="/products" />
        <Suspense fallback={<SkeletonGrid />}>
          <RecentProducts />
        </Suspense>
      </section>
    </main>
  );
}
