import { getProducts } from '@/app/lib/products';
import { CategoryFilter } from '@/components/products/category-filter';
import { ProductCard } from '@/components/products/product-card';
import { SearchBar } from '@/components/products/search-bar';
import { getCategories } from '../lib/categories';


interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const filteredProducts = products.filter((product) => {
    const selectedCategory = categories.find((cat) => cat.slug === params.category);
    const matchesCategory = !params.category || product.category_id === selectedCategory?.id;
    const matchesSearch =
      !params.search ||
      product.name.toLowerCase().includes(params.search.toLowerCase()) ||
      product.brand.toLowerCase().includes(params.search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Collection</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <SearchBar />
        <CategoryFilter categories={categories} activeCategory={params.category || null} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
