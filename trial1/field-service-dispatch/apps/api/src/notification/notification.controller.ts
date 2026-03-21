import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { NotificationService, SendNotificationDto, NotificationListQuery } from './notification.service';
import { CurrentCompany, Roles } from '../common/decorators';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER')
  async send(
    @CurrentCompany() companyId: string,
    @Body() dto: SendNotificationDto,
  ) {
    return this.notificationService.send(companyId, dto);
  }

  @Post('work-order/:workOrderId')
  @Roles('ADMIN', 'DISPATCHER')
  async sendWorkOrderNotification(
    @CurrentCompany() companyId: string,
    @Param('workOrderId') workOrderId: string,
    @Body()
    body: {
      type: string;
      recipientType: string;
      recipientId: string;
      recipientContact: string;
      channel: string;
    },
  ) {
    return this.notificationService.sendWorkOrderNotification(
      companyId,
      workOrderId,
      body.type,
      body.recipientType,
      body.recipientId,
      body.recipientContact,
      body.channel,
    );
  }

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  async list(
    @CurrentCompany() companyId: string,
    @Query() query: NotificationListQuery,
  ) {
    return this.notificationService.list(companyId, query);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER')
  async get(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
  ) {
    return this.notificationService.get(companyId, id);
  }
}
