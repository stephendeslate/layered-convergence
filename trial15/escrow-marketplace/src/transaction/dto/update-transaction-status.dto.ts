import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  status!: TransactionStatus;

  @IsOptional()
  shippingInfo?: Record<string, unknown>;
}
