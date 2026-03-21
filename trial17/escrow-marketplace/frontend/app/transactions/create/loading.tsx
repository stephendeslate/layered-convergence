export default function CreateTransactionLoading() {
  return (
    <div className="flex flex-col gap-4 max-w-lg" role="status">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
      <div className="h-24 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
      <span className="sr-only">Loading form...</span>
    </div>
  );
}
