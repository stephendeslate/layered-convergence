import { CreateWorkOrderForm } from './create-form';

export default function CreateWorkOrderPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create Work Order</h1>
      <CreateWorkOrderForm />
    </div>
  );
}
