import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DispatchController],
  providers: [DispatchService, PrismaService],
})
export class DispatchModule {}
