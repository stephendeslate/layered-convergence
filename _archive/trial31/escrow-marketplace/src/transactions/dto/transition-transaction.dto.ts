import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class TransitionTransactionDto {
  @IsEnum(TransactionStatus)
  status!: TransactionStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
