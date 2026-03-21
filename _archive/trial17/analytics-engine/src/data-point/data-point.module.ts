import { Module } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { DataPointController } from './data-point.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [DataPointService],
  controllers: [DataPointController],
  exports: [DataPointService],
})
export class DataPointModule {}
