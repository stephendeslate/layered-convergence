import { IsString, MinLength } from 'class-validator';

export class CreatePayoutDto {
  @IsString()
  @MinLength(1)
  transactionId!: string;
}
