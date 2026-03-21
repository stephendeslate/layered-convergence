// [TRACED:EM-022] Transaction creation endpoint
// [TRACED:EM-023] Transaction transition endpoint
import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TransactionService } from "./transaction.service";

@Controller("transactions")
@UseGuards(AuthGuard("jwt"))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() body: { buyerId: string; sellerId: string; amount: number; description?: string }) {
    return this.transactionService.createTransaction(body.buyerId, body.sellerId, body.amount, body.description);
  }

  @Post(":id/transition")
  transition(@Param("id") id: string, @Body() body: { status: string }) {
    return this.transactionService.transitionTransaction(id, body.status);
  }

  @Get("user/:userId")
  getByUser(@Param("userId") userId: string) {
    return this.transactionService.getTransactionsByUser(userId);
  }
}
