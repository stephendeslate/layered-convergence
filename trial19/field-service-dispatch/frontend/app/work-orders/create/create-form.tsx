'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createWorkOrderAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ActionState, Customer } from '@/lib/types';

const initialState: ActionState = {};

interface CreateFormProps {
  customers: Customer[];
}

export function CreateForm({ customers }: CreateFormProps) {
  const [state, formAction, pending] = useActionState(createWorkOrderAction, initialState);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.error && resultRef.current) {
      resultRef.current.focus();
    }
  }, [state]);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Create Work Order</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div ref={resultRef} tabIndex={-1} role="alert" className="text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer</Label>
            <Select name="customerId" required>
              <SelectTrigger id="customerId">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority (1-5)</Label>
            <Select name="priority" required>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Low</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3 - Medium</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5 - High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? 'Creating...' : 'Create Work Order'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
