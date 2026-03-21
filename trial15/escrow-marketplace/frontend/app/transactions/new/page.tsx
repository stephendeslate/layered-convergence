"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CreateTransactionState {
  error: string | null;
  success: boolean;
}

async function createTransactionAction(
  _prevState: CreateTransactionState,
  formData: FormData
): Promise<CreateTransactionState> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const amountStr = formData.get("amount") as string;
  const currency = formData.get("currency") as string;
  const sellerId = formData.get("sellerId") as string;

  if (!title || !description || !amountStr || !currency || !sellerId) {
    return { error: "All fields are required", success: false };
  }

  const amount = Math.round(parseFloat(amountStr) * 100);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be a positive number", success: false };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  const getCookie = (name: string): string | undefined => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match?.[2];
  };

  const token = getCookie("auth_token");

  const response = await fetch(`${apiUrl}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ title, description, amount, currency, sellerId }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({
      message: "Failed to create transaction",
    }));
    return { error: (body as { message: string }).message, success: false };
  }

  const data = (await response.json()) as { id: string };
  window.location.href = `/transactions/${data.id}`;
  return { error: null, success: true };
}

export default function NewTransactionPage() {
  const [state, formAction, isPending] = useActionState(
    createTransactionAction,
    { error: null, success: false }
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Transaction</CardTitle>
          <CardDescription>
            Set up a new escrow transaction with a seller
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.error && (
            <div
              className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tx-title">Title</Label>
              <Input
                id="tx-title"
                name="title"
                placeholder="What is being purchased?"
                required
                minLength={3}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tx-description">Description</Label>
              <Textarea
                id="tx-description"
                name="description"
                placeholder="Describe the item or service in detail"
                required
                minLength={10}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tx-amount">Amount</Label>
                <Input
                  id="tx-amount"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tx-currency">Currency</Label>
                <Select id="tx-currency" name="currency" required defaultValue="USD">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tx-seller">Seller ID</Label>
              <Input
                id="tx-seller"
                name="sellerId"
                placeholder="Enter the seller's user ID"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create Transaction"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
