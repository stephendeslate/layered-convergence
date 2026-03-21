import Link from "next/link";
import type { DataSource } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusVariant = "success" | "secondary" | "warning" | "destructive";

function statusVariant(status: DataSource["status"]): StatusVariant {
  const map: Record<DataSource["status"], StatusVariant> = {
    connected: "success",
    disconnected: "secondary",
    syncing: "warning",
    error: "destructive",
  };
  return map[status];
}

interface DataSourceCardProps {
  dataSource: DataSource;
}

export function DataSourceCard({ dataSource }: DataSourceCardProps) {
  return (
    <Link href={`/data-sources/${dataSource.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{dataSource.name}</CardTitle>
            <Badge variant={statusVariant(dataSource.status)}>
              {dataSource.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="capitalize">{dataSource.type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Last Sync</dt>
              <dd>
                {dataSource.lastSyncAt
                  ? new Date(dataSource.lastSyncAt).toLocaleDateString()
                  : "Never"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </Link>
  );
}
