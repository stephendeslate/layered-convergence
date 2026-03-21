import { Module } from '@nestjs/common';
import { EmbedConfigService } from './embed-config.service';
import { EmbedConfigController } from './embed-config.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [EmbedConfigController],
  providers: [EmbedConfigService, PrismaService],
  exports: [EmbedConfigService],
})
export class EmbedConfigModule {}
