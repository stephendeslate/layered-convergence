import { Module } from '@nestjs/common';
import { EmbedController, EmbedDataController } from './embed.controller';
import { EmbedService } from './embed.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EmbedController, EmbedDataController],
  providers: [EmbedService],
  exports: [EmbedService],
})
export class EmbedModule {}
