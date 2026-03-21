import { Module } from '@nestjs/common';
import { DeadLetterController } from './dead-letter.controller';
import { DeadLetterService } from './dead-letter.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [DeadLetterController],
  providers: [DeadLetterService, PrismaService],
  exports: [DeadLetterService],
})
export class DeadLetterModule {}
