import { Module } from '@nestjs/common';
import { EmbedController } from './embed.controller';
import { EmbedService } from './embed.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [EmbedController],
  providers: [EmbedService, PrismaService],
  exports: [EmbedService],
})
export class EmbedModule {}
