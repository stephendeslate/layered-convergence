import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// [TRACED:FD-SA-002] PrismaModule is global
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
