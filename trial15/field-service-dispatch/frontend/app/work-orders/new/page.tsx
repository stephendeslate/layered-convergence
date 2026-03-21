"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface CreateWorkOrderState {
  error: string | null;
  fieldErrors: Record<string, string>;
}

async function createWorkOrderAction(
  _prevState: CreateWorkOrderState,
  formData: FormData
): Promise<CreateWorkOrderState> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const customerId = formData.get("customerId") as string;
  const address = formData.get("address") as string;
  const scheduledDate = formData.get("scheduledDate") as string;
  const estimatedDuration = formData.get("estimatedDuration") as string;
  const notes = formData.get("notes") as string;

  const fieldErrors: Record<string, string> = {};

  if (!title.trim()) fieldErrors.title = "Title is required";
  if (!description.trim())
    fieldErrors.description = "Description is required";
  if (!priority) fieldErrors.priority = "Priority is required";
  if (!customerId.trim())
    fieldErrors.customerId = "Customer ID is required";
  if (!address.trim()) fieldErrors.address = "Address is required";

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the errors below", fieldErrors };
  }

  const apiUrl = process.env.API_BASE_URL ?? "http://localhost:3001";

  const body: Record<string, string | number> = {
    title: title.trim(),
    description: description.trim(),
    priority,
    customerId: customerId.trim(),
    address: address.trim(),
  };

  if (scheduledDate) {
    body.scheduledDate = scheduledDate;
  }
  if (estimatedDuration) {
    body.estimatedDuration = parseInt(estimatedDuration, 10);
  }
  if (notes.trim()) {
    body.notes = notes.trim();
  }

  const tokenMatch = document.cookie.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : "";

  const response = await fetch(`${apiUrl}/work-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    return {
      error: errorData.message ?? "Failed to create work order",
      fieldErrors: {},
    };
  }

  redirect("/work-orders");
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Work Order"}
    </Button>
  );
}

export default function NewWorkOrderPage() {
  const [state, formAction] = useActionState(createWorkOrderAction, {
    error: null,
    fieldErrors: {},
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/work-orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to work orders</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New Work Order</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state.error && (
              <div
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g., HVAC Repair"
                aria-invalid={!!state.fieldErrors.title}
                aria-describedby={
                  state.fieldErrors.title ? "title-error" : undefined
                }
              />
              {state.fieldErrors.title && (
                <p id="title-error" className="text-sm text-destructive">
                  {state.fieldErrors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe the work to be done..."
                aria-invalid={!!state.fieldErrors.description}
                aria-describedby={
                  state.fieldErrors.description
                    ? "description-error"
                    : undefined
                }
              />
              {state.fieldErrors.description && (
                <p
                  id="description-error"
                  className="text-sm text-destructive"
                >
                  {state.fieldErrors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue=""
                aria-invalid={!!state.fieldErrors.priority}
                aria-describedby={
                  state.fieldErrors.priority
                    ? "priority-error"
                    : undefined
                }
              >
                <option value="" disabled>
                  Select priority
                </option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              {state.fieldErrors.priority && (
                <p
                  id="priority-error"
                  className="text-sm text-destructive"
                >
                  {state.fieldErrors.priority}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                name="customerId"
                required
                placeholder="Customer UUID"
                aria-invalid={!!state.fieldErrors.customerId}
                aria-describedby={
                  state.fieldErrors.customerId
                    ? "customerId-error"
                    : undefined
                }
              />
              {state.fieldErrors.customerId && (
                <p
                  id="customerId-error"
                  className="text-sm text-destructive"
                >
                  {state.fieldErrors.customerId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                required
                placeholder="123 Main St, City, State"
                aria-invalid={!!state.fieldErrors.address}
                aria-describedby={
                  state.fieldErrors.address
                    ? "address-error"
                    : undefined
                }
              />
              {state.fieldErrors.address && (
                <p
                  id="address-error"
                  className="text-sm text-destructive"
                >
                  {state.fieldErrors.address}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  name="scheduledDate"
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">
                  Estimated Duration (minutes)
                </Label>
                <Input
                  id="estimatedDuration"
                  name="estimatedDuration"
                  type="number"
                  min="1"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <SubmitButton />
              <Link href="/work-orders">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
