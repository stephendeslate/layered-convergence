import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
