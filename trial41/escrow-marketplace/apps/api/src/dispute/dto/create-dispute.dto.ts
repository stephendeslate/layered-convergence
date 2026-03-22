import { IsString, MaxLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @MaxLength(2000)
  reason: string;

  @IsString()
  @MaxLength(36)
  transactionId: string;

  @IsString()
  @MaxLength(36)
  respondentId: string;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
