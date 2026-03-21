import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  transactionId: string;

  @IsOptional()
  @IsObject()
  evidence?: Record<string, unknown>;
}

export enum DisputeResolutionEnum {
  BUYER_FAVOR = 'BUYER_FAVOR',
  PROVIDER_FAVOR = 'PROVIDER_FAVOR',
  ESCALATED = 'ESCALATED',
}

export class ResolveDisputeDto {
  @IsEnum(DisputeResolutionEnum)
  resolution: string;
}
