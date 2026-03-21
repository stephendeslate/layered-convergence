import { Module } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { DataPointController } from './data-point.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DataPointController],
  providers: [DataPointService],
  exports: [DataPointService],
})
export class DataPointModule {}
