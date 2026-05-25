import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductDetailsClient } from '@/components/product/ProductDetailsClient';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { api } from '@/lib/api';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await api.products.getOne(slug) as any;
    const product = res?.data ?? res;
    return {
      title: product.title,
      description: product.description?.substring(0, 160),
      openGraph: {
        title: product.title,
        description: product.description?.substring(0, 160),
        images: product.images?.[0] ? [{ url: product.images[0].url }] : [],
        type: 'website',
      },
      other: {
        'product:price:amount': product.price,
        'product:price:currency': product.currency,
      },
    };
  } catch {
    return { title: 'Publicación no encontrada' };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product: any;
  try {
    const res = await api.products.getOne(slug) as any;
    // Unwrap TransformInterceptor envelope { success, data: {...} }
    product = res?.data ?? res;
  } catch {
    notFound();
  }

  if (!product?.id) notFound();

  return (
    <main className="container-app py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <a href="/" className="hover:text-primary-600">Inicio</a>
        <span>/</span>
        <a href="/products" className="hover:text-primary-600">Publicaciones</a>
        <span>/</span>
        <a href={`/products?category=${product.category?.slug}`} className="hover:text-primary-600">
          {product.category?.name}
        </a>
        <span>/</span>
        <span className="text-slate-900 dark:text-white truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        {/* Gallery */}
        <ProductGallery images={product.images} videos={product.videos} />

        {/* Info + Actions */}
        <ProductDetailsClient product={product} />
      </div>

      {/* Related */}
      <section>
        <h2 className="text-xl font-bold mb-6">Publicaciones similares</h2>
        <RelatedProducts productId={product.id} />
      </section>
    </main>
  );
}
