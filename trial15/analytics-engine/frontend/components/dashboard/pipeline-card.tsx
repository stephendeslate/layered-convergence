import type { Pipeline } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StatusVariant = "default" | "success" | "warning" | "destructive" | "secondary";

function statusVariant(status: Pipeline["status"]): StatusVariant {
  const map: Record<Pipeline["status"], StatusVariant> = {
    idle: "secondary",
    running: "warning",
    completed: "success",
    failed: "destructive",
    cancelled: "default",
  };
  return map[status];
}

interface PipelineCardProps {
  pipeline: Pipeline;
}

export function PipelineCard({ pipeline }: PipelineCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{pipeline.name}</CardTitle>
          <Badge variant={statusVariant(pipeline.status)}>
            {pipeline.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {pipeline.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Schedule</dt>
            <dd>
              {pipeline.schedule ? (
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  {pipeline.schedule}
                </code>
              ) : (
                "Manual"
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Last Run</dt>
            <dd>
              {pipeline.lastRunAt
                ? new Date(pipeline.lastRunAt).toLocaleDateString()
                : "Never"}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
