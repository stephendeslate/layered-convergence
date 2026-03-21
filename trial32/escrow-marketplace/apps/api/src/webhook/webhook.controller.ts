import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(@Request() req: { user: { tenantId: string } }, @Body() body: { url: string; events: string[] }) {
    return this.webhookService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.webhookService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.webhookService.findOne(id, req.user.tenantId);
  }

  @Post(':id/deactivate')
  deactivate(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.webhookService.deactivate(id, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.webhookService.remove(id, req.user.tenantId);
  }
}
