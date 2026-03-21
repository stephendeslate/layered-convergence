"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResolveDisputeFormProps {
  disputeId: string;
  resolveAction: (
    prevState: { error: string | null; success: boolean },
    formData: FormData
  ) => Promise<{ error: string | null; success: boolean }>;
}

export function ResolveDisputeForm({
  disputeId,
  resolveAction,
}: ResolveDisputeFormProps) {
  const [state, formAction, isPending] = useActionState(resolveAction, {
    error: null,
    success: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resolve Dispute</CardTitle>
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

        {state.success ? (
          <div
            className="rounded-md bg-green-50 p-3 text-sm text-green-700"
            role="status"
          >
            Dispute resolved successfully.
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="disputeId" value={disputeId} />

            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution Details</Label>
              <Textarea
                id="resolution"
                name="resolution"
                placeholder="Describe the resolution..."
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Select id="outcome" name="outcome" required defaultValue="">
                <option value="" disabled>
                  Select outcome
                </option>
                <option value="RELEASE">Release funds to seller</option>
                <option value="REFUND">Refund buyer</option>
              </Select>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Resolving..." : "Resolve Dispute"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
