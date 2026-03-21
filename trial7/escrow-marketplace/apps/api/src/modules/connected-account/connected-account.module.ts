import { Module } from '@nestjs/common';
import { ConnectedAccountController } from './connected-account.controller';
import { ConnectedAccountService } from './connected-account.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [ConnectedAccountController],
  providers: [ConnectedAccountService, PrismaService],
  exports: [ConnectedAccountService],
})
export class ConnectedAccountModule {}
