import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createTransactionAction } from '@/app/actions';

export default function NewTransactionPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTransactionAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellerId">Seller ID</Label>
              <Input id="sellerId" name="sellerId" type="text" required />
            </div>
            <input type="hidden" name="token" value="" />
            <Button type="submit" className="w-full">
              Create Transaction
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
