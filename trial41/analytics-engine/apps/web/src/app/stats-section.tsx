'use client';

import { Card, CardContent } from '../../components/ui/card';

export default function StatsSection() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">1,247</div>
          <p className="text-xs text-gray-500">Total Events</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-gray-500">Active Dashboards</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-gray-500">Data Sources</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-gray-500">Active Pipelines</p>
        </CardContent>
      </Card>
    </div>
  );
}
