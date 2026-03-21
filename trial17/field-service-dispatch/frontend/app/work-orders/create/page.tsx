import { Suspense } from 'react';
import { getAvailableTechnicians, getCustomers } from '@/lib/api';
import { CreateWorkOrderForm } from './create-form';

async function CreateFormWithData() {
  const [technicians, customers] = await Promise.all([
    getAvailableTechnicians(),
    getCustomers(),
  ]);

  return <CreateWorkOrderForm technicians={technicians} customers={customers} />;
}

export default function CreateWorkOrderPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Work Order</h1>
      <Suspense fallback={<div className="animate-pulse max-w-lg space-y-4">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-slate-200 rounded" />)}</div>}>
        <CreateFormWithData />
      </Suspense>
    </div>
  );
}
