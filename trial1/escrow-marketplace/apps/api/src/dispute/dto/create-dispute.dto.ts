import { IsString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { DisputeReason } from '@prisma/client';

export class CreateDisputeDto {
  @IsString()
  transactionId: string;

  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;
}
