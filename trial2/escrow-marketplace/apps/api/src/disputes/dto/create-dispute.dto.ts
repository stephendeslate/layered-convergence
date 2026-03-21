import { IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { DisputeReason } from '@repo/shared';

export class CreateDisputeDto {
  @IsUUID()
  transactionId!: string;

  @IsEnum(DisputeReason)
  reason!: DisputeReason;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;
}
