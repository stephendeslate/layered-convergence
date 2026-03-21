import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AutoReleaseService } from './auto-release.service';
import { AutoReleaseProcessor } from './auto-release.processor';
import { AUTO_RELEASE_QUEUE } from './auto-release.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: AUTO_RELEASE_QUEUE }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, AutoReleaseService, AutoReleaseProcessor],
  exports: [TransactionsService, AutoReleaseService],
})
export class TransactionsModule {}
