import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePayoutDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
