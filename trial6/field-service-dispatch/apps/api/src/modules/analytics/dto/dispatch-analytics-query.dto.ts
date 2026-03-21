import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class DispatchAnalyticsQueryDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
