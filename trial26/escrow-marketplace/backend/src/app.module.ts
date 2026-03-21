import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./common/prisma.module";
import { TransactionModule } from "./transaction/transaction.module";
import { DisputeModule } from "./dispute/dispute.module";
import { PayoutModule } from "./payout/payout.module";
import { WebhookModule } from "./webhook/webhook.module";

@Module({
  imports: [PrismaModule, AuthModule, TransactionModule, DisputeModule, PayoutModule, WebhookModule],
})
export class AppModule {}
