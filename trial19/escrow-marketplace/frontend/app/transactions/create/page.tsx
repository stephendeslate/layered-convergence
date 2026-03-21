import { CreateTransactionForm } from './create-form';

export default function CreateTransactionPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create Transaction</h1>
      <CreateTransactionForm />
    </div>
  );
}
