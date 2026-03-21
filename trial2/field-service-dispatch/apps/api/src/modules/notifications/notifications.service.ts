import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

interface WorkOrderEvent {
  workOrderId: string;
  companyId: string;
  workOrder?: unknown;
}

interface StatusChangedEvent {
  workOrderId: string;
  companyId: string;
  fromStatus: string;
  toStatus: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  @OnEvent('work-order.notify-technician')
  handleNotifyTechnician(event: WorkOrderEvent) {
    this.logger.log(`[SMS STUB] Notify technician for work order ${event.workOrderId}`);
  }

  @OnEvent('work-order.notify-customer-en-route')
  handleNotifyCustomerEnRoute(event: WorkOrderEvent) {
    this.logger.log(`[SMS STUB] Notify customer: technician en route for work order ${event.workOrderId}`);
  }

  @OnEvent('work-order.notify-customer-arrived')
  handleNotifyCustomerArrived(event: WorkOrderEvent) {
    this.logger.log(`[SMS STUB] Notify customer: technician arrived for work order ${event.workOrderId}`);
  }

  @OnEvent('work-order.send-invoice-to-customer')
  handleSendInvoice(event: WorkOrderEvent) {
    this.logger.log(`[EMAIL STUB] Send invoice to customer for work order ${event.workOrderId}`);
  }

  @OnEvent('work-order.send-payment-receipt')
  handleSendReceipt(event: WorkOrderEvent) {
    this.logger.log(`[EMAIL STUB] Send payment receipt for work order ${event.workOrderId}`);
  }

  @OnEvent('work-order.status-changed')
  handleStatusChanged(event: StatusChangedEvent) {
    this.logger.log(
      `Work order ${event.workOrderId} status changed: ${event.fromStatus} -> ${event.toStatus}`,
    );
  }

  async sendSms(to: string, message: string): Promise<{ sent: boolean }> {
    this.logger.log(`[SMS STUB] To: ${to}, Message: ${message}`);
    return { sent: true };
  }

  async sendEmail(to: string, subject: string, body: string): Promise<{ sent: boolean }> {
    this.logger.log(`[EMAIL STUB] To: ${to}, Subject: ${subject}`);
    return { sent: true };
  }
}
