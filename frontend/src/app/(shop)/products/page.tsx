import { Suspense } from 'react';
import { ProductsContent } from './ProductsContent';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
