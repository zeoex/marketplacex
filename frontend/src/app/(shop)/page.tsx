import { Suspense } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesGrid } from '@/components/home/CategoriesGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { RecentProducts } from '@/components/home/RecentProducts';
import { TrustBadges } from '@/components/home/TrustBadges';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <HeroSection />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Categories */}
      <section className="container-app py-12">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <CategoriesGrid />
      </section>

      {/* Featured Products */}
      <section className="bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Listings</h2>
            <a href="/products?featured=true" className="text-primary-600 hover:underline text-sm font-medium">
              View all →
            </a>
          </div>
          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          }>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* Recent Products */}
      <section className="container-app py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Listings</h2>
          <a href="/products" className="text-primary-600 hover:underline text-sm font-medium">
            View all →
          </a>
        </div>
        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        }>
          <RecentProducts />
        </Suspense>
      </section>
    </main>
  );
}
