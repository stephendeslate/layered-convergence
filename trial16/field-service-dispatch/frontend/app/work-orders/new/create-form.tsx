'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createWorkOrder } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { Customer } from '@/lib/types';

interface CreateWorkOrderFormProps {
  customers: Customer[];
}

export function CreateWorkOrderForm({ customers }: CreateWorkOrderFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createWorkOrder, null);

  useEffect(() => {
    if (state?.success) {
      router.push('/work-orders');
    }
  }, [state?.success, router]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="text-sm text-destructive" role="alert">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Work order title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the work to be done"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerId">Customer</Label>
            <Select id="customerId" name="customerId" required>
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.address}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select id="priority" name="priority">
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating...' : 'Create Work Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
