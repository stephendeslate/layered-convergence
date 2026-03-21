import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  transactionId!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsArray()
  evidence?: Record<string, unknown>[];
}
