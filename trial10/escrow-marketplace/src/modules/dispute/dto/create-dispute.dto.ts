import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  transactionId!: string;

  @IsString()
  @MinLength(10)
  reason!: string;

  @IsOptional()
  evidence?: Record<string, unknown>[];
}

export class ResolveDisputeDto {
  @IsString()
  resolution!: string;

  @IsString()
  outcome!: 'buyer' | 'provider';
}
