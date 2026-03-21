import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';

export interface SendNotificationDto {
  workOrderId?: string;
  recipientType: string;
  recipientId: string;
  channel: string;
  type: string;
  subject?: string;
  body: string;
  recipientContact: string; // email or phone number
}

export interface NotificationListQuery {
  page?: number;
  pageSize?: number;
  workOrderId?: string;
  channel?: string;
  type?: string;
  recipientId?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly resendClient: any | null = null;
  private readonly fromEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {
    const resendApiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL ?? 'noreply@fieldservice.dev';

    if (resendApiKey) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Resend } = require('resend');
        this.resendClient = new Resend(resendApiKey);
        this.logger.log('Resend email client initialized (live mode)');
      } catch {
        this.logger.warn('Resend package not installed — running in mock mode');
      }
    } else {
      this.logger.log('RESEND_API_KEY not set — email in mock/log mode');
    }
  }

  /**
   * Send a notification (email or SMS) and persist to DB.
   */
  async send(companyId: string, dto: SendNotificationDto) {
    // Persist notification record
    const notification = await this.prisma.notification.create({
      data: {
        companyId,
        workOrderId: dto.workOrderId,
        recipientType: dto.recipientType as any,
        recipientId: dto.recipientId,
        channel: dto.channel as any,
        type: dto.type as any,
        subject: dto.subject,
        body: dto.body,
      },
    });

    let externalId: string | undefined;
    let error: string | undefined;

    try {
      if (dto.channel === 'EMAIL') {
        const result = await this.sendEmail(
          dto.recipientContact,
          dto.subject ?? 'Field Service Update',
          dto.body,
        );
        externalId = result.externalId;
        error = result.error;
      } else if (dto.channel === 'SMS') {
        const result = await this.smsService.send({
          to: dto.recipientContact,
          body: dto.body,
        });
        externalId = result.externalId;
        if (!result.success) error = result.error;
      }

      // Update notification with delivery result
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: error
          ? { failedAt: new Date(), failureReason: error }
          : { sentAt: new Date(), externalId },
      });
    } catch (err: any) {
      this.logger.error(`Notification delivery failed: ${err.message}`);
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { failedAt: new Date(), failureReason: err.message },
      });
    }

    return this.prisma.notification.findUnique({
      where: { id: notification.id },
    });
  }

  /**
   * Send work order lifecycle notifications.
   */
  async sendWorkOrderNotification(
    companyId: string,
    workOrderId: string,
    type: string,
    recipientType: string,
    recipientId: string,
    recipientContact: string,
    channel: string,
  ) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
      include: {
        technician: { include: { user: { select: { firstName: true, lastName: true } } } },
        customer: true,
        company: { select: { name: true } },
      },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order ${workOrderId} not found`);
    }

    const body = this.buildMessage(type, workOrder);
    const subject = this.buildSubject(type, workOrder.company.name);

    return this.send(companyId, {
      workOrderId,
      recipientType,
      recipientId,
      channel,
      type,
      subject,
      body,
      recipientContact,
    });
  }

  async get(companyId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, companyId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }

    return notification;
  }

  async list(companyId: string, query: NotificationListQuery) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (query.workOrderId) where.workOrderId = query.workOrderId;
    if (query.channel) where.channel = query.channel;
    if (query.type) where.type = query.type;
    if (query.recipientId) where.recipientId = query.recipientId;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private async sendEmail(
    to: string,
    subject: string,
    htmlBody: string,
  ): Promise<{ externalId?: string; error?: string }> {
    if (!this.resendClient) {
      this.logger.log(
        `[MOCK EMAIL] to=${to} subject="${subject}" body="${htmlBody.substring(0, 100)}..."`,
      );
      return { externalId: `mock-email-${Date.now()}` };
    }

    try {
      const result = await this.resendClient.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html: htmlBody,
      });
      this.logger.log(`Email sent to ${to}, id=${result.id}`);
      return { externalId: result.id };
    } catch (err: any) {
      this.logger.error(`Email failed to ${to}: ${err.message}`);
      return { error: err.message };
    }
  }

  private buildSubject(type: string, companyName: string): string {
    const subjects: Record<string, string> = {
      TECHNICIAN_DISPATCHED: `${companyName} — Technician Dispatched`,
      TECHNICIAN_EN_ROUTE: `${companyName} — Technician En Route`,
      ARRIVING_SOON_15: `${companyName} — Technician Arriving in 15 Minutes`,
      ARRIVING_SOON_5: `${companyName} — Technician Almost There`,
      TECHNICIAN_ARRIVED: `${companyName} — Technician Has Arrived`,
      JOB_COMPLETED: `${companyName} — Job Completed`,
      INVOICE_SENT: `${companyName} — Invoice Ready`,
      NEW_ASSIGNMENT: `${companyName} — New Job Assignment`,
      JOB_CANCELLED: `${companyName} — Job Cancelled`,
      PAYMENT_RECEIVED: `${companyName} — Payment Received`,
    };
    return subjects[type] ?? `${companyName} — Service Update`;
  }

  private buildMessage(type: string, workOrder: any): string {
    const techName = workOrder.technician
      ? `${workOrder.technician.user.firstName} ${workOrder.technician.user.lastName}`
      : 'A technician';
    const customerName = `${workOrder.customer.firstName} ${workOrder.customer.lastName}`;

    const messages: Record<string, string> = {
      TECHNICIAN_DISPATCHED: `Hi ${customerName}, ${techName} has been dispatched for your ${workOrder.serviceType.replace(/_/g, ' ')} service at ${workOrder.address}.`,
      TECHNICIAN_EN_ROUTE: `${techName} is on the way to ${workOrder.address}. They should arrive soon.`,
      ARRIVING_SOON_15: `${techName} is about 15 minutes away from ${workOrder.address}.`,
      ARRIVING_SOON_5: `${techName} is almost there — about 5 minutes from ${workOrder.address}.`,
      TECHNICIAN_ARRIVED: `${techName} has arrived at ${workOrder.address}.`,
      JOB_COMPLETED: `Your ${workOrder.serviceType.replace(/_/g, ' ')} service at ${workOrder.address} has been completed by ${techName}.`,
      INVOICE_SENT: `Your invoice for the service at ${workOrder.address} is ready. Please check your email for payment details.`,
      NEW_ASSIGNMENT: `You have a new job assignment: ${workOrder.serviceType.replace(/_/g, ' ')} at ${workOrder.address} scheduled for ${workOrder.scheduledStart.toISOString()}.`,
      JOB_CANCELLED: `The ${workOrder.serviceType.replace(/_/g, ' ')} service at ${workOrder.address} has been cancelled.`,
      PAYMENT_RECEIVED: `Payment received for service at ${workOrder.address}. Thank you!`,
    };

    return messages[type] ?? `Update for your service at ${workOrder.address}.`;
  }
}
