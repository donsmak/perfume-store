import { Product } from '@/app/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`, {
    next: { revalidate: 60 }, // Revalidate every 60 mins
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  return data.products;
}

export async function getFilteredProducts(params: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  bestseller?: boolean;
  sort?: 'price_asc' | 'price_desc';
}): Promise<Product[]> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.set(key, value.toString());
    }
  });

  const response = await fetch(`${API_URL}/products/filter?${queryParams.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch filtered products');
  }

  const data = await response.json();
  return data.products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const response = await fetch(`${API_URL}/products/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error('Failed to fetch product by slug');
  }

  return response.json();
}
