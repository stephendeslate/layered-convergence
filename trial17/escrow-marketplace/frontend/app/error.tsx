'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center py-16 gap-4">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-gray-600">{error.message || 'An unexpected error occurred'}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
      >
        Try again
      </button>
    </div>
  );
}
