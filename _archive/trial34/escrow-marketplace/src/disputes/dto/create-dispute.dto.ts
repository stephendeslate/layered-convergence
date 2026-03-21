import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDisputeDto {
  @IsUUID()
  transactionId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  evidence?: string;
}
