'use client';

import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  activeCategory: string | null;
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }

    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      <Button
        variant={activeCategory === null ? 'default' : 'outline'}
        onClick={() => handleCategoryChange(null)}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.slug ? 'default' : 'outline'}
          onClick={() => handleCategoryChange(category.slug)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
