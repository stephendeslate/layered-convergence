import { Injectable, Logger } from '@nestjs/common';

/**
 * Invoice generation processor — generates invoice PDF on work order completion.
 * In production, creates a PDF and optionally sends to Stripe.
 */
@Injectable()
export class InvoiceGenerationProcessor {
  private readonly logger = new Logger(InvoiceGenerationProcessor.name);

  async processGenerateInvoice(data: {
    companyId: string;
    workOrderId: string;
  }) {
    this.logger.log(
      `Generating invoice for work order ${data.workOrderId}`,
    );
    // In production: create Invoice record, generate PDF, store in object storage
  }

  async processSendInvoiceStripe(data: {
    companyId: string;
    invoiceId: string;
  }) {
    this.logger.log(
      `Sending invoice ${data.invoiceId} via Stripe`,
    );
    // In production: create Stripe Invoice, send email, update status
  }
}
