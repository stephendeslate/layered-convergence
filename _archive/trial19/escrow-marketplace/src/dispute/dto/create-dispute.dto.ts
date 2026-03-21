import { IsString, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  transactionId: string;

  @IsString()
  @MinLength(10)
  reason: string;
}
