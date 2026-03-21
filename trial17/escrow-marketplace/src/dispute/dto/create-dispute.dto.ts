import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @MinLength(1)
  transactionId!: string;

  @IsString()
  @MinLength(1)
  reason!: string;

  @IsOptional()
  @IsString()
  evidence?: string;
}
