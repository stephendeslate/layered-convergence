import { Module } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { EmbedController } from './embed.controller';
import { TenantContextModule } from '../tenant-context/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  providers: [EmbedService],
  controllers: [EmbedController],
  exports: [EmbedService],
})
export class EmbedModule {}
