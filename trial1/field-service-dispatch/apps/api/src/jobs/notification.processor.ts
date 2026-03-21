import { Injectable, Logger } from '@nestjs/common';

/**
 * Notification processor — sends SMS/email on status changes.
 * In production, integrates with Twilio (SMS) and Resend (email).
 */
@Injectable()
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  async processNewAssignment(data: {
    companyId: string;
    workOrderId: string;
    technicianId: string;
  }) {
    this.logger.log(
      `Sending new assignment notification for WO ${data.workOrderId} to tech ${data.technicianId}`,
    );
    // In production: send push notification to technician
  }

  async processTechnicianEnRoute(data: {
    companyId: string;
    workOrderId: string;
    trackingToken: string;
  }) {
    this.logger.log(
      `Sending en-route notification for WO ${data.workOrderId}`,
    );
    // In production: send SMS + email to customer with tracking link
  }

  async processJobCompleted(data: {
    companyId: string;
    workOrderId: string;
  }) {
    this.logger.log(
      `Sending job completed notification for WO ${data.workOrderId}`,
    );
    // In production: send email to customer
  }

  async processJobCancelled(data: {
    companyId: string;
    workOrderId: string;
    reason: string;
  }) {
    this.logger.log(
      `Sending cancellation notification for WO ${data.workOrderId}`,
    );
    // In production: send notifications to technician and customer
  }
}
