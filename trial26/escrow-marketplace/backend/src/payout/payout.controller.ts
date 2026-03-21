import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PayoutService } from "./payout.service";

@Controller("payouts")
@UseGuards(AuthGuard("jwt"))
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  create(@Body() body: { transactionId: string; amount: number }) {
    return this.payoutService.createPayout(body.transactionId, body.amount);
  }

  @Post(":id/transition")
  transition(@Param("id") id: string, @Body() body: { status: string; failureReason?: string }) {
    return this.payoutService.transitionPayout(id, body.status, body.failureReason);
  }
}
