import { getProducts } from '@/app/lib/products';
import { ProductCard } from '@/components/products/product-card';

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products.filter((product) => product.is_featured);
  const bestsellerProducts = products.filter((product) => product.is_bestseller);

  return (
    <main className="container mx-auto py-4 px-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Luxury Perfumes</h1>
        <p className="text-gray-600">Discover your signature scent</p>
      </div>
      {/* Featured Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Best Sellers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestsellerProducts.slice(0.3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
