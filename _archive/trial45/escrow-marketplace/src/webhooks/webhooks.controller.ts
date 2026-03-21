import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('webhooks')
@UseFilters(PrismaExceptionFilter)
@UseGuards(RolesGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('endpoints')
  createEndpoint(@Request() req: any, @Body() dto: CreateWebhookEndpointDto) {
    return this.webhooksService.createEndpoint(req.user.id, dto);
  }

  @Get('endpoints')
  findEndpoints(@Request() req: any) {
    return this.webhooksService.findEndpoints(req.user.id);
  }

  @Get('endpoints/:id')
  findEndpointById(@Param('id') id: string) {
    return this.webhooksService.findEndpointById(id);
  }

  @Delete('endpoints/:id')
  deleteEndpoint(@Param('id') id: string) {
    return this.webhooksService.deleteEndpoint(id);
  }

  @Get('endpoints/:id/events')
  findEvents(@Param('id') id: string) {
    return this.webhooksService.findEvents(id);
  }
}
