import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class TransitionTransactionDto {
  @IsEnum(TransactionStatus)
  toStatus!: TransactionStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
