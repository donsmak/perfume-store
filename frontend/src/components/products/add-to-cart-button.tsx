'use client';

import { useCart } from '@/lib/cart';
import { Button } from '../ui/button';
import { Product } from '@/app/types/product';
import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const cart = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    cart.addItem(product.id);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };
  return (
    <Button
      onClick={handleAddToCart}
      className="w-full md:w-auto"
      disabled={isAdded || product.stock_quantity === 0}
    >
      {isAdded ? (
        <span className="flex items-center gap-2">
          <Check className="w-4 h-4" /> Added to Cart
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" /> Add to Cart
        </span>
      )}
    </Button>
  );
}
