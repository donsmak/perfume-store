export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Collection</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="w-full max-w-sm h-10 bg-gray-200 animate-pulse rounded-md" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 animate-pulse rounded-md" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-[3/4]" />
        ))}
      </div>
    </main>
  );
}
