import { fetchCustomers } from '@/lib/api';
import { CreateForm } from './create-form';

export default async function CreateWorkOrderPage() {
  const customers = await fetchCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Work Order</h1>
      <CreateForm customers={customers} />
    </div>
  );
}
