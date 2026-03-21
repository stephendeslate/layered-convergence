export default function TransactionDetailLoading() {
  return (
    <div className="flex flex-col gap-4" role="status">
      <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
      <div className="h-48 bg-gray-200 rounded animate-pulse" />
      <div className="h-12 bg-gray-200 rounded w-48 animate-pulse" />
      <span className="sr-only">Loading transaction details...</span>
    </div>
  );
}
