import { Injectable, Logger } from '@nestjs/common';

/**
 * Reminder processor — sends reminders before scheduled appointments.
 */
@Injectable()
export class ReminderProcessor {
  private readonly logger = new Logger(ReminderProcessor.name);

  async processAppointmentReminder(data: {
    companyId: string;
    workOrderId: string;
    customerEmail: string;
    scheduledStart: string;
  }) {
    this.logger.log(
      `Sending appointment reminder for WO ${data.workOrderId} at ${data.scheduledStart}`,
    );
    // In production: send SMS/email reminder to customer
  }
}
