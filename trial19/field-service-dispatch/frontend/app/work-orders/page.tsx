import { fetchWorkOrders } from '@/lib/api';
import { StatusBoard } from '@/components/status-board';
import { Button } from '@/components/ui/button';

export default async function WorkOrdersPage() {
  const workOrders = await fetchWorkOrders();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <Button asChild>
          <a href="/work-orders/create">Create Work Order</a>
        </Button>
      </div>
      <StatusBoard workOrders={workOrders} />
    </div>
  );
}
