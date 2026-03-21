import { IsUUID, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateDisputeDto {
  @IsUUID()
  transactionId: string;

  @IsUUID()
  raisedById: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsObject()
  evidence?: Record<string, unknown>;
}
