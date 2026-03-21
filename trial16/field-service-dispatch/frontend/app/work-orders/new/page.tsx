import { Suspense } from 'react';
import { getCustomers } from '@/lib/api';
import { CreateWorkOrderForm } from './create-form';

async function CreateWorkOrderContent() {
  const customers = await getCustomers();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Work Order</h1>
      <CreateWorkOrderForm customers={customers} />
    </div>
  );
}

export default function CreateWorkOrderPage() {
  return (
    <Suspense fallback={<CreateSkeleton />}>
      <CreateWorkOrderContent />
    </Suspense>
  );
}

function CreateSkeleton() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="space-y-4 border rounded-lg p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
