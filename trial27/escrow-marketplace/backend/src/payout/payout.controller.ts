import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PayoutService } from "./payout.service";

@Controller("payouts")
@UseGuards(AuthGuard("jwt"))
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get("transaction/:id")
  findByTransaction(@Param("id") id: string) {
    return this.payoutService.findByTransaction(id);
  }
}
