import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DisputeStatus } from '@prisma/client';

export class DisputeQueryDto {
  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsEnum(DisputeStatus)
  @IsOptional()
  status?: DisputeStatus;
}
