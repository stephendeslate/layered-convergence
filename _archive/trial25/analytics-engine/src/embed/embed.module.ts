import { Module } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { EmbedController } from './embed.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [EmbedService],
  controllers: [EmbedController],
  exports: [EmbedService],
})
export class EmbedModule {}
