import { IsNotEmpty, IsString, IsUUID, IsNumberString } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  sellerId!: string;

  @IsNumberString()
  @IsNotEmpty()
  amount!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
