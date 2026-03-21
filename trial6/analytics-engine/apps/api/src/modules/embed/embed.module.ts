import { Module } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { EmbedController } from './embed.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [EmbedController],
  providers: [EmbedService, PrismaService],
  exports: [EmbedService],
})
export class EmbedModule {}
