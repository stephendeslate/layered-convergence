import {
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  buyerId: string;

  @IsUUID()
  providerId: string;

  @IsInt()
  @Min(100) // minimum $1.00
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  platformFeeRate?: number;

  @IsOptional()
  @IsDateString()
  holdUntil?: string;
}
