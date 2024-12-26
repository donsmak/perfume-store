'use client';

import { useCart } from '@/lib/cart';
import { getProducts } from '../lib/products';
import { useEffect, useState } from 'react';
import { Product } from '../types/product';
import Image from 'next/image';

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await getProducts();
      setProducts(allProducts);
      setLoading(false);
    };
    loadProducts();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const cartItems = items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.id),
  }));

  const total = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="space-y-8">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 border-b pb-4">
              <div className="relative w-24 h-24">
                <Image
                  src={item.product?.image || ''}
                  alt={item.product?.name || ''}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.product?.name}</h3>
                <p className="text-sm text-muted-foreground">{item.product?.brand}</p>
                <p className="font-medium">${item.product?.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
            <button className="bg-zinc-900 text-white px-6 py-2 rounded-lg hover:bg-zinc-800">
              Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
