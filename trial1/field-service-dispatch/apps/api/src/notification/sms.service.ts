import { Injectable, Logger } from '@nestjs/common';

export interface SmsPayload {
  to: string;
  body: string;
  from?: string;
}

export interface SmsResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly twilioClient: any | null = null;
  private readonly fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_FROM_NUMBER ?? '+15555555555';

    if (accountSid && authToken) {
      try {
        // Dynamic import to avoid requiring twilio in dev
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const twilio = require('twilio');
        this.twilioClient = twilio(accountSid, authToken);
        this.logger.log('Twilio SMS client initialized (live mode)');
      } catch {
        this.logger.warn('Twilio package not installed — running in mock mode');
      }
    } else {
      this.logger.log('TWILIO_ACCOUNT_SID not set — SMS in mock/log mode');
    }
  }

  async send(payload: SmsPayload): Promise<SmsResult> {
    const from = payload.from ?? this.fromNumber;

    if (!this.twilioClient) {
      this.logger.log(
        `[MOCK SMS] to=${payload.to} from=${from} body="${payload.body}"`,
      );
      return { success: true, externalId: `mock-sms-${Date.now()}` };
    }

    try {
      const message = await this.twilioClient.messages.create({
        to: payload.to,
        from,
        body: payload.body,
      });

      this.logger.log(`SMS sent to ${payload.to}, sid=${message.sid}`);
      return { success: true, externalId: message.sid };
    } catch (err: any) {
      this.logger.error(`SMS failed to ${payload.to}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}
