import { ProductCard } from '@/components/product/ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/featured`, {
      next: { revalidate: 300 }, // 5 min cache
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data ?? data ?? [];
  } catch {
    return [];
  }
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.slice(0, 8).map((product: any, i: number) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
