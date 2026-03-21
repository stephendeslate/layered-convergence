import { Nav } from '@/components/nav';
import { CreateTransactionForm } from './create-form';

export default function CreateTransactionPage() {
  return (
    <>
      <Nav />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Create Transaction</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <CreateTransactionForm />
        </div>
      </div>
    </>
  );
}
