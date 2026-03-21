"use client";

import { useState, useCallback, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, type SelectOption } from "@/components/ui/select";
import type { Dashboard, EmbedCreatePayload } from "@/lib/types";

interface EmbedConfigFormProps {
  dashboards: Dashboard[];
  onSubmit: (payload: EmbedCreatePayload) => Promise<void>;
}

function EmbedConfigForm({ dashboards, onSubmit }: EmbedConfigFormProps) {
  const [dashboardId, setDashboardId] = useState("");
  const [originsInput, setOriginsInput] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const dashboardOptions: SelectOption[] = dashboards.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      if (!dashboardId) {
        setFormError("Please select a dashboard");
        return;
      }

      const allowedOrigins = originsInput
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);

      if (allowedOrigins.length === 0) {
        setFormError("At least one allowed origin is required");
        return;
      }

      const payload: EmbedCreatePayload = {
        dashboardId,
        allowedOrigins,
      };

      if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).toISOString();
      }

      setIsSubmitting(true);
      try {
        await onSubmit(payload);
        setDashboardId("");
        setOriginsInput("");
        setExpiresAt("");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create embed";
        setFormError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [dashboardId, originsInput, expiresAt, onSubmit]
  );

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create Embed Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Dashboard"
            options={dashboardOptions}
            value={dashboardId}
            onChange={(e) => setDashboardId(e.target.value)}
            placeholder="Select a dashboard"
            required
          />

          <Input
            label="Allowed Origins"
            placeholder="https://example.com, https://app.example.com"
            value={originsInput}
            onChange={(e) => setOriginsInput(e.target.value)}
            required
            aria-describedby="origins-hint"
          />
          <p id="origins-hint" className="text-xs text-muted-foreground">
            Comma-separated list of allowed origins for embedding
          </p>

          <Input
            label="Expires At"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Embed"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export { EmbedConfigForm, type EmbedConfigFormProps };
