'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge, PriorityBadge } from '@/components/work-order/status-badge';
import { StatusTimeline } from '@/components/work-order/status-timeline';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime, formatTime, serviceTypeLabel } from '@/lib/utils';
import {
  WorkOrderStatus,
  WORK_ORDER_TRANSITIONS,
} from '@fsd/shared';
import type { WorkOrderDto, LineItemDto, JobPhotoDto, InvoiceDto, TechnicianDto } from '@fsd/shared';

const TRANSITION_LABELS: Partial<Record<WorkOrderStatus, string>> = {
  [WorkOrderStatus.ASSIGNED]: 'Assign Technician',
  [WorkOrderStatus.EN_ROUTE]: 'Start Route',
  [WorkOrderStatus.ON_SITE]: 'Mark Arrived',
  [WorkOrderStatus.IN_PROGRESS]: 'Start Work',
  [WorkOrderStatus.COMPLETED]: 'Complete Job',
  [WorkOrderStatus.INVOICED]: 'Create Invoice',
  [WorkOrderStatus.CANCELLED]: 'Cancel',
};

const TRANSITION_COLORS: Partial<Record<WorkOrderStatus, string>> = {
  [WorkOrderStatus.COMPLETED]: 'success',
  [WorkOrderStatus.CANCELLED]: 'destructive',
};

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [workOrder, setWorkOrder] = useState<WorkOrderDto | null>(null);
  const [lineItems, setLineItems] = useState<LineItemDto[]>([]);
  const [photos, setPhotos] = useState<JobPhotoDto[]>([]);
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [transitionNotes, setTransitionNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [wo, items, pics, hist, techs] = await Promise.all([
        api.get<WorkOrderDto>(`/work-orders/${id}`),
        api.get<LineItemDto[]>(`/work-orders/${id}/line-items`).catch(() => []),
        api.get<JobPhotoDto[]>(`/work-orders/${id}/photos`).catch(() => []),
        api.get<any[]>(`/work-orders/${id}/history`).catch(() => []),
        api.get<TechnicianDto[]>('/technicians').catch(() => []),
      ]);
      setWorkOrder(wo);
      setLineItems(items);
      setPhotos(pics);
      setHistory(hist);
      setTechnicians(techs);

      // Try to get invoice
      try {
        const inv = await api.get<InvoiceDto>(`/work-orders/${id}/invoice`);
        setInvoice(inv);
      } catch {
        // No invoice yet
      }
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransition = async (newStatus: WorkOrderStatus) => {
    if (!workOrder) return;

    if (newStatus === WorkOrderStatus.ASSIGNED && !workOrder.technicianId) {
      setShowAssignDialog(true);
      return;
    }

    try {
      await api.patch(`/work-orders/${id}/transition`, {
        status: newStatus,
        notes: transitionNotes || undefined,
      });
      setTransitionNotes('');
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Transition failed');
    }
  };

  const handleAssign = async () => {
    if (!selectedTechId) return;
    try {
      await api.post(`/work-orders/${id}/assign`, { technicianId: selectedTechId });
      setShowAssignDialog(false);
      setSelectedTechId('');
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Assignment failed');
    }
  };

  if (isLoading || !workOrder) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const allowedTransitions = WORK_ORDER_TRANSITIONS[workOrder.status];
  const subtotal = lineItems.reduce((sum, li) => sum + li.totalPrice, 0);
  const taxItems = lineItems.filter((li) => li.type === 'TAX');
  const taxAmount = taxItems.reduce((sum, li) => sum + li.totalPrice, 0);
  const total = subtotal + taxAmount;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/work-orders" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Work Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Work Order {workOrder.referenceNumber}
            </h1>
            <StatusBadge status={workOrder.status} />
            <PriorityBadge priority={workOrder.priority} />
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/work-orders/${id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTimeline currentStatus={workOrder.status} history={history} />
        </CardContent>
      </Card>

      {/* Transition Buttons */}
      {allowedTransitions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allowedTransitions.map((nextStatus) => (
            <Button
              key={nextStatus}
              variant={
                (TRANSITION_COLORS[nextStatus] as any) || 'outline'
              }
              size="sm"
              onClick={() => handleTransition(nextStatus)}
            >
              {TRANSITION_LABELS[nextStatus] || nextStatus}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Service Type</span>
              <span className="font-medium">{serviceTypeLabel(workOrder.serviceType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Description</span>
              <span className="font-medium max-w-[60%] text-right">{workOrder.description || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Duration</span>
              <span className="font-medium">{workOrder.estimatedMinutes} min</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-500">Scheduled</span>
              <span className="font-medium">
                {formatDate(workOrder.scheduledStart)}, {formatTime(workOrder.scheduledStart)} - {formatTime(workOrder.scheduledEnd)}
              </span>
            </div>
            {workOrder.actualStart && (
              <div className="flex justify-between">
                <span className="text-gray-500">Actual Start</span>
                <span className="font-medium">{formatDateTime(workOrder.actualStart)}</span>
              </div>
            )}
            {workOrder.actualEnd && (
              <div className="flex justify-between">
                <span className="text-gray-500">Actual End</span>
                <span className="font-medium">{formatDateTime(workOrder.actualEnd)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Technician</span>
              {workOrder.technician ? (
                <Link
                  href={`/technicians/${workOrder.technician.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {workOrder.technician.user.firstName} {workOrder.technician.user.lastName}
                </Link>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setShowAssignDialog(true)}>
                  Assign Technician
                </Button>
              )}
            </div>
            {workOrder.technician?.user.phone && (
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{workOrder.technician.user.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {workOrder.customer ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">
                    {workOrder.customer.firstName} {workOrder.customer.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{workOrder.customer.email}</span>
                </div>
                {workOrder.customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium">{workOrder.customer.phone}</span>
                  </div>
                )}
                {workOrder.trackingToken && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tracking Link</span>
                    <Link
                      href={`/track/${workOrder.trackingToken}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View Portal
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-400">No customer assigned</span>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{workOrder.address}</p>
            <p className="text-gray-500">
              {workOrder.city}, {workOrder.state} {workOrder.zipCode}
            </p>
            <p className="text-xs text-gray-400">
              {workOrder.latitude.toFixed(6)}, {workOrder.longitude.toFixed(6)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.filter((li) => li.type !== 'TAX').map((li) => (
                <TableRow key={li.id}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{li.type}</Badge>
                  </TableCell>
                  <TableCell>{li.description}</TableCell>
                  <TableCell className="text-right">{li.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(li.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(li.totalPrice)}</TableCell>
                </TableRow>
              ))}
              {lineItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-6">
                    No line items yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {lineItems.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 space-y-1 text-sm text-right">
              <div className="flex justify-end gap-8">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium w-24">{formatCurrency(subtotal)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex justify-end gap-8">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium w-24">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-end gap-8 text-base font-semibold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span className="w-24">{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Job photo'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No photos uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Invoice */}
      {invoice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="font-medium">{invoice.invoiceNumber}</span>
              <Badge variant={invoice.status === 'PAID' ? 'success' : 'outline'}>
                {invoice.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{formatCurrency(invoice.totalAmount)}</span>
              <Link href={`/invoices/${invoice.id}`}>
                <Button variant="outline" size="sm">View Invoice</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {workOrder.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{workOrder.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedTechId} onChange={(e) => setSelectedTechId(e.target.value)}>
              <option value="">Select a technician...</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.user.firstName} {tech.user.lastName} - {tech.status}
                </option>
              ))}
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedTechId}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
