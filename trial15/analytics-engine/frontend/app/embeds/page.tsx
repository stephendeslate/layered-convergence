"use client";

import { useState, useEffect, type FormEvent } from "react";
import { apiClient } from "@/lib/api";
import type { EmbedConfig, Dashboard } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";

function getCookieValue(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export default function EmbedsPage() {
  const [embeds, setEmbeds] = useState<EmbedConfig[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState("");
  const [allowedOrigins, setAllowedOrigins] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const token = getCookieValue("auth-token");
      const tenantId = getCookieValue("tenant-id");
      const options = { token, tenantId };

      try {
        const [embedsResponse, dashboardsResponse] = await Promise.all([
          apiClient.getEmbeds(options),
          apiClient.getDashboards(options),
        ]);
        setEmbeds(embedsResponse.data);
        setDashboards(dashboardsResponse.data);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);

    const token = getCookieValue("auth-token");
    const tenantId = getCookieValue("tenant-id");
    const options = { token, tenantId };

    try {
      const origins = allowedOrigins
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      const newEmbed = await apiClient.createEmbed(
        { dashboardId: selectedDashboard, allowedOrigins: origins },
        options
      );
      setEmbeds((prev) => [...prev, newEmbed]);
      setDialogOpen(false);
      setSelectedDashboard("");
      setAllowedOrigins("");
    } catch (err) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError("Failed to create embed configuration.");
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="h-9 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Embed Configurations</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button>Create Embed</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Embed Configuration</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              {createError && (
                <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {createError}
                </div>
              )}
              <div className="space-y-2">
                <Select
                  label="Dashboard"
                  id="embed-dashboard"
                  options={dashboards.map((d) => ({ value: d.id, label: d.name }))}
                  placeholder="Select a dashboard"
                  value={selectedDashboard}
                  onChange={(e) => setSelectedDashboard(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowed-origins">Allowed Origins</Label>
                <Input
                  id="allowed-origins"
                  type="text"
                  placeholder="https://example.com, https://app.example.com"
                  value={allowedOrigins}
                  onChange={(e) => setAllowedOrigins(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of allowed origins for the embed
                </p>
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {embeds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-lg font-medium text-muted-foreground">
              No embed configurations
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create an embed to share dashboards externally.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Embeds</CardTitle>
            <CardDescription>{embeds.length} embed configuration{embeds.length !== 1 ? "s" : ""}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dashboard</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Origins</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {embeds.map((embed) => {
                  const dashboard = dashboards.find((d) => d.id === embed.dashboardId);
                  return (
                    <TableRow key={embed.id}>
                      <TableCell className="font-medium">
                        {dashboard ? dashboard.name : embed.dashboardId}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {embed.token.substring(0, 12)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={embed.isActive ? "success" : "secondary"}>
                          {embed.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {embed.allowedOrigins.map((origin) => (
                            <Badge key={origin} variant="secondary" className="text-xs">
                              {origin}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {embed.expiresAt
                          ? new Date(embed.expiresAt).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
