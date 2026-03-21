import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class TransitionTransactionDto {
  @IsEnum(TransactionStatus)
  toStatus: TransactionStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
