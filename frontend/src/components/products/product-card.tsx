import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Product } from '@/app/types/product';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="relative aspect-square ">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <p className="text-sm mt-2">{product.volume}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <p className="font-semibold">${product.price.toFixed(2)}</p>
          {product.stock_quantity < 10 && <span className="text-sm text-red-500">Low Stock</span>}
        </CardFooter>
      </Card>
    </Link>
  );
}
