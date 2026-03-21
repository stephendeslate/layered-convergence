import { Module } from '@nestjs/common';
import { ConnectedAccountService } from './connected-account.service';
import { ConnectedAccountController } from './connected-account.controller';

@Module({
  controllers: [ConnectedAccountController],
  providers: [ConnectedAccountService],
  exports: [ConnectedAccountService],
})
export class ConnectedAccountModule {}
