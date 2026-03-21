'use client';

import { createDataSource } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function DataSourceForm() {
  return (
    <form action={createDataSource} aria-label="Create data source form" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ds-name">Name</Label>
        <Input id="ds-name" name="name" type="text" required aria-label="Data source name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ds-type">Type</Label>
        <Select name="type" defaultValue="POSTGRESQL">
          <SelectTrigger aria-label="Select data source type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="POSTGRESQL">PostgreSQL</SelectItem>
            <SelectItem value="MYSQL">MySQL</SelectItem>
            <SelectItem value="CSV">CSV</SelectItem>
            <SelectItem value="API">API</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ds-connection">Connection String</Label>
        <Input id="ds-connection" name="connectionString" type="text" required aria-label="Connection string" />
      </div>
      <Button type="submit" aria-label="Add data source">
        Add Data Source
      </Button>
    </form>
  );
}
