import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDisputeDto {
  @IsUUID()
  transactionId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
