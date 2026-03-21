import { Module } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { EmbedController } from './embed.controller';

@Module({
  providers: [EmbedService],
  controllers: [EmbedController],
  exports: [EmbedService],
})
export class EmbedModule {}
