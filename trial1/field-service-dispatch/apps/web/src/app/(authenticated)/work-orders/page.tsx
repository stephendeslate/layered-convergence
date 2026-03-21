'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge, PriorityBadge } from '@/components/work-order/status-badge';
import { WorkOrderStatus, Priority, ServiceType } from '@fsd/shared';
import type { WorkOrderDto, PaginatedResponse } from '@fsd/shared';
import { api } from '@/lib/api';
import { serviceTypeLabel, formatDateTime } from '@/lib/utils';

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrderDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    loadWorkOrders();
  }, [page, filters]);

  const loadWorkOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.search) params.set('search', filters.search);
      const result = await api.get<PaginatedResponse<WorkOrderDto>>(`/work-orders?${params}`);
      setWorkOrders(result.data);
      setTotal(result.total);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total work orders</p>
        </div>
        <Link href="/work-orders/new">
          <Button>
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" x2="12" y1="5" y2="19" />
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            New Work Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search work orders..."
              className="max-w-xs"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
            <Select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-40"
            >
              <option value="">All Statuses</option>
              {Object.values(WorkOrderStatus).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </Select>
            <Select
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
              className="w-36"
            >
              <option value="">All Priorities</option>
              {Object.values(Priority).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
            {(filters.status || filters.priority || filters.search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ status: '', priority: '', search: '' })}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead className="hidden md:table-cell">Technician</TableHead>
                <TableHead className="hidden lg:table-cell">Scheduled</TableHead>
                <TableHead className="hidden lg:table-cell">Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-5 bg-gray-100 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : workOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No work orders found
                  </TableCell>
                </TableRow>
              ) : (
                workOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell>
                      <Link
                        href={`/work-orders/${wo.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {wo.referenceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{serviceTypeLabel(wo.serviceType)}</TableCell>
                    <TableCell>
                      <StatusBadge status={wo.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={wo.priority} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                      {wo.customer
                        ? `${wo.customer.firstName} ${wo.customer.lastName}`
                        : '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                      {wo.technician
                        ? `${wo.technician.user.firstName} ${wo.technician.user.lastName}`
                        : '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                      {formatDateTime(wo.scheduledStart)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-gray-500 max-w-[200px] truncate">
                      {wo.address}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
