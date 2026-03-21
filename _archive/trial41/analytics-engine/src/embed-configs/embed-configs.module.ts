import { Module } from '@nestjs/common';
import { EmbedConfigsService } from './embed-configs.service';
import { EmbedConfigsController } from './embed-configs.controller';

@Module({
  controllers: [EmbedConfigsController],
  providers: [EmbedConfigsService],
  exports: [EmbedConfigsService],
})
export class EmbedConfigsModule {}
