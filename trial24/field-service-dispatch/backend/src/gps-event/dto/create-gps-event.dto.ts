import { IsNumber, IsDateString, IsUUID, IsIn, IsOptional } from 'class-validator';

export class CreateGpsEventDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsDateString()
  timestamp!: string;

  @IsIn(['CHECK_IN', 'CHECK_OUT', 'EN_ROUTE', 'IDLE'])
  @IsOptional()
  eventType?: 'CHECK_IN' | 'CHECK_OUT' | 'EN_ROUTE' | 'IDLE';

  @IsUUID()
  technicianId!: string;
}
