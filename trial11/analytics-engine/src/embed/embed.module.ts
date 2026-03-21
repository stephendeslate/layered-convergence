import { Module } from '@nestjs/common';
import { EmbedService } from './embed.service.js';
import { EmbedController } from './embed.controller.js';
import { TenantModule } from '../tenant/tenant.module.js';

@Module({
  imports: [TenantModule],
  controllers: [EmbedController],
  providers: [EmbedService],
})
export class EmbedModule {}
