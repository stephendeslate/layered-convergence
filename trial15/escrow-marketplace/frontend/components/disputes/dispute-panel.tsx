"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DisputePanelProps {
  transactionId: string;
  submitAction: (
    prevState: { error: string | null; success: boolean },
    formData: FormData
  ) => Promise<{ error: string | null; success: boolean }>;
}

export function DisputePanel({
  transactionId,
  submitAction,
}: DisputePanelProps) {
  const [state, formAction, isPending] = useActionState(submitAction, {
    error: null,
    success: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>File a Dispute</CardTitle>
      </CardHeader>
      <CardContent>
        {state.error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {state.error}
          </div>
        )}

        {state.success ? (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700" role="status">
            Dispute filed successfully. Our team will review it shortly.
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="transactionId" value={transactionId} />

            <div className="space-y-2">
              <Label htmlFor="dispute-reason">Reason for Dispute</Label>
              <Input
                id="dispute-reason"
                name="reason"
                placeholder="Brief summary of the issue"
                required
                minLength={10}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dispute-evidence">Evidence</Label>
              <Textarea
                id="dispute-evidence"
                name="evidence"
                placeholder="Provide detailed evidence supporting your dispute (screenshots, communication records, etc.)"
                required
                minLength={20}
                rows={5}
              />
            </div>

            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Filing Dispute..." : "File Dispute"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
