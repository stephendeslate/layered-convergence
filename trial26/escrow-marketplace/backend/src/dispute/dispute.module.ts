import { Module } from "@nestjs/common";
import { DisputeService } from "./dispute.service";
import { DisputeController } from "./dispute.controller";

@Module({
  providers: [DisputeService],
  controllers: [DisputeController],
})
export class DisputeModule {}
