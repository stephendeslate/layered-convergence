// [TRACED:EM-024] Dispute filing endpoint
import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DisputeService } from "./dispute.service";

@Controller("disputes")
@UseGuards(AuthGuard("jwt"))
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  file(@Body() body: { transactionId: string; filedBy: string; reason: string }) {
    return this.disputeService.fileDispute(body.transactionId, body.filedBy, body.reason);
  }

  @Post(":id/transition")
  transition(@Param("id") id: string, @Body() body: { status: string; resolution?: string }) {
    return this.disputeService.transitionDispute(id, body.status, body.resolution);
  }
}
