import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class TransactionQueryDto {
  @IsString()
  @IsOptional()
  buyerId?: string;

  @IsString()
  @IsOptional()
  providerId?: string;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
