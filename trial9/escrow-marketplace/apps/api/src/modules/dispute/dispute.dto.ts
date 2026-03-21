import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  transactionId!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsArray()
  evidence?: Record<string, unknown>[];
}

export class ResolveDisputeDto {
  @IsIn(['resolved_buyer', 'resolved_provider', 'escalated'])
  resolution!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
