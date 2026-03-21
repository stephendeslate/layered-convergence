'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalyticsOverview } from '@fsd/shared';

const jobsPerDay = [
  { day: 'Mon', completed: 32, created: 35 },
  { day: 'Tue', completed: 38, created: 40 },
  { day: 'Wed', completed: 35, created: 33 },
  { day: 'Thu', completed: 45, created: 42 },
  { day: 'Fri', completed: 42, created: 44 },
  { day: 'Sat', completed: 28, created: 25 },
  { day: 'Sun', completed: 15, created: 12 },
];

const avgCompletionTime = [
  { day: 'Mon', minutes: 55 },
  { day: 'Tue', minutes: 48 },
  { day: 'Wed', minutes: 52 },
  { day: 'Thu', minutes: 45 },
  { day: 'Fri', minutes: 50 },
  { day: 'Sat', minutes: 58 },
  { day: 'Sun', minutes: 42 },
];

const techUtilization = [
  { name: 'Tyler S.', utilization: 85 },
  { name: 'Sarah K.', utilization: 78 },
  { name: 'Jake M.', utilization: 45 },
  { name: 'Lisa T.', utilization: 72 },
  { name: 'Mark R.', utilization: 32 },
];

const revenueData = [
  { day: 'Mon', revenue: 1520 },
  { day: 'Tue', revenue: 2100 },
  { day: 'Wed', revenue: 1850 },
  { day: 'Thu', revenue: 2450 },
  { day: 'Fri', revenue: 2230 },
  { day: 'Sat', revenue: 1400 },
  { day: 'Sun', revenue: 900 },
];

interface AnalyticsChartsProps {
  overview: AnalyticsOverview;
}

export function AnalyticsCharts({ overview }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Jobs per Day */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jobs Completed (7-day trend)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobsPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#3B82F6" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="created" fill="#93C5FD" name="Created" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Average Completion Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avg Completion Time (minutes)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={avgCompletionTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={{ fill: '#F97316', r: 4 }}
                  name="Avg Minutes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Technician Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Technician Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techUtilization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} fontSize={12} />
                <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="utilization" fill="#22C55E" radius={[0, 4, 4, 0]} name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="#8B5CF640"
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
