import { ProductCard } from '@/components/product/ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getRelatedProducts(productId: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/${productId}/related`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data ?? data ?? [];
  } catch {
    return [];
  }
}

interface Props { productId: string }

export async function RelatedProducts({ productId }: Props) {
  const products = await getRelatedProducts(productId);

  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.slice(0, 8).map((product: any, i: number) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
