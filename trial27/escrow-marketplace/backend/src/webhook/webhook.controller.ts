import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WebhookService } from "./webhook.service";

@Controller("webhooks")
@UseGuards(AuthGuard("jwt"))
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  findAll() {
    return this.webhookService.findAll();
  }

  @Post()
  create(@Body() body: { url: string; secret: string; events: string[] }) {
    return this.webhookService.create(body);
  }
}
