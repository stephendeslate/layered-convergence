import { Module } from '@nestjs/common';
import { AutoReleaseProcessor } from './auto-release.processor';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [TransactionModule],
  providers: [AutoReleaseProcessor],
  exports: [AutoReleaseProcessor],
})
export class JobsModule {}
