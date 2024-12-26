export default function CartLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl front-bold mb-8">Shopping Cart</h1>
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div className="flex gap-4 border-b pb-4" key={i}>
            <div className="w-24 h-24 bg-gray-200 animate-pulse rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
