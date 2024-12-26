export interface FragranceNotes {
  top: string[];
  middle: string[];
  base: string[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  category_id: number;
  description: string;
  price: number;
  volume: string;
  fragrance_notes: FragranceNotes;
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  image: string;
}
