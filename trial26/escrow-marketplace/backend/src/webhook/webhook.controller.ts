import { Controller, Get, Post, Body, Param, Delete, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WebhookService } from "./webhook.service";

@Controller("webhooks")
@UseGuards(AuthGuard("jwt"))
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(@Body() body: { url: string; events: string[]; secret: string }) {
    return this.webhookService.createWebhook(body.url, body.events, body.secret);
  }

  @Get()
  getActive() {
    return this.webhookService.getActiveWebhooks();
  }

  @Delete(":id")
  deactivate(@Param("id") id: string) {
    return this.webhookService.deactivateWebhook(id);
  }
}
