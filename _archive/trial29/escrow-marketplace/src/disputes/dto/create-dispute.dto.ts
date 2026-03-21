import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDisputeDto {
  @IsUUID()
  @IsNotEmpty()
  transactionId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsOptional()
  evidence?: string;
}
