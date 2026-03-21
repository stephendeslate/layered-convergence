import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(@Body() dto: CreateWebhookDto) {
    return this.webhookService.create(dto);
  }

  @Get()
  findAll() {
    return this.webhookService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.webhookService.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.webhookService.delete(id);
  }
}
