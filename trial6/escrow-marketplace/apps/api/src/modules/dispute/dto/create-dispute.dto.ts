import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  raisedById: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ResolveDisputeDto {
  @IsString()
  @IsNotEmpty()
  resolution: string;

  @IsString()
  @IsNotEmpty()
  resolvedInFavorOf: 'buyer' | 'provider';
}

export class DisputeEvidenceDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  evidenceUrl: string;
}
