import { getProductBySlug, getProducts } from '@/app/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AddToCartButton } from '@/components/products/add-to-cart-button';

// Pre-render all possible product pages
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square">
          <Image src={product.image} alt={product.name} fill className="object-cover rounded-lg" />
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl text-muted-foreground">{product.brand}</p>
          <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
          <p className="text-zinc-600">{product.description}</p>

          {/* Fragrance Notes */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Fragrance Notes</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium">Top Notes</h3>
                <ul className="text-sm text-zinc-600">
                  {product.fragrance_notes.top.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium">Middle Notes</h3>
                <ul className="text-sm text-zinc-600">
                  {product.fragrance_notes.middle.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium">Base Notes</h3>
                <ul className="text-sm text-zinc-600">
                  {product.fragrance_notes.base.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                product.stock_quantity > 10 ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm">
              {product.stock_quantity > 10
                ? 'In Stock'
                : `Low Stock (${product.stock_quantity} left)`}
            </span>
          </div>

          {/* Add to Cart Button */}
          <AddToCartButton product={product} />
        </div>
      </div>
    </main>
  );
}
