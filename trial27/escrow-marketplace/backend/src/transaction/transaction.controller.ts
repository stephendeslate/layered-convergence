// [TRACED:EM-008] Transaction API endpoints
// [TRACED:EM-022] GET /transactions returns user's buy/sell transactions
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TransactionService } from "./transaction.service";

@Controller("transactions")
@UseGuards(AuthGuard("jwt"))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.transactionService.findByUser(req.user.id);
  }

  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() body: { sellerId: string; amount: number; description: string },
  ) {
    return this.transactionService.create({
      buyerId: req.user.id,
      sellerId: body.sellerId,
      amount: body.amount,
      description: body.description,
    });
  }

  @Post(":id/transition")
  transition(
    @Param("id") id: string,
    @Body() body: { status: string },
  ) {
    return this.transactionService.transition(id, body.status);
  }
}
