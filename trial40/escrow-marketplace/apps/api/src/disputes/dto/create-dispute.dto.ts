import { IsString, MaxLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @MaxLength(1000)
  reason!: string;

  @IsString()
  @MaxLength(36)
  transactionId!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
