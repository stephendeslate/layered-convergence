import { IsString, IsInt, IsOptional, IsDateString, IsEnum, Min, MinLength } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  providerId: string;

  @IsInt()
  @Min(100) // minimum $1.00
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  platformFee?: number;

  @IsOptional()
  @IsDateString()
  holdUntil?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export enum TransactionStatusEnum {
  PENDING = 'PENDING',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}

export class TransitionTransactionDto {
  @IsEnum(TransactionStatusEnum)
  toStatus: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
