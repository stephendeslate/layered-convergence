import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DisputeService } from "./dispute.service";

@Controller("disputes")
@UseGuards(AuthGuard("jwt"))
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() body: { transactionId: string; reason: string },
  ) {
    return this.disputeService.create({
      transactionId: body.transactionId,
      filedBy: req.user.id,
      reason: body.reason,
    });
  }

  @Post(":id/resolve")
  resolve(
    @Param("id") id: string,
    @Body() body: { resolution: string; outcome: string },
  ) {
    return this.disputeService.resolve(id, body.resolution, body.outcome);
  }
}
