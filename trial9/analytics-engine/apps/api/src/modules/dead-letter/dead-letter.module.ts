import { Module } from '@nestjs/common';
import { DeadLetterService } from './dead-letter.service';
import { DeadLetterController } from './dead-letter.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [DeadLetterController],
  providers: [DeadLetterService, PrismaService],
  exports: [DeadLetterService],
})
export class DeadLetterModule {}
