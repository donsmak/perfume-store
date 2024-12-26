'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const cart = useCart();
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link className="text-xl font-semibold" href="/">
            Luxury Perfumes
          </Link>

          <div className="flex gap-6">
            <Link href="/products" className="hover:text-zinc-600">
              Products
            </Link>
            <Link href="/categories" className="hover:text-zinc-600">
              Categories
            </Link>
            <Link href="/cart" className="hover:text-zinc-600">
              Cart
              {itemCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {itemCount}
                </Badge>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
