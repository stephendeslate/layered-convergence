import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
