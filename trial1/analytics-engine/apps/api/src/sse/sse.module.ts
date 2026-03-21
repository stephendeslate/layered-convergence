import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';
import { EmbedModule } from '../embed/embed.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [EmbedModule, AuthModule],
  controllers: [SseController],
  providers: [SseService],
  exports: [SseService],
})
export class SseModule {}
