import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SmsService } from './sms.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, SmsService],
  exports: [NotificationService, SmsService],
})
export class NotificationModule {}
