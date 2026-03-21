import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
import { EtaService } from './eta.service';

@Module({
  providers: [DispatchService, EtaService],
  controllers: [DispatchController],
  exports: [DispatchService, EtaService],
})
export class DispatchModule {}
