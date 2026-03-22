// TRACED: FD-SA-005 — Service areas module
import { Module } from '@nestjs/common';
import { ServiceAreasController } from './service-areas.controller';
import { ServiceAreasService } from './service-areas.service';

@Module({
  controllers: [ServiceAreasController],
  providers: [ServiceAreasService],
  exports: [ServiceAreasService],
})
export class ServiceAreasModule {}
