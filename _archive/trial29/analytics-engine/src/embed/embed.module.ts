import { Module } from '@nestjs/common';
import { EmbedService } from './embed.service.js';
import { EmbedController } from './embed.controller.js';

@Module({
  controllers: [EmbedController],
  providers: [EmbedService],
  exports: [EmbedService],
})
export class EmbedModule {}
