import { IsString, IsUUID } from 'class-validator';

export class CreateDisputeDto {
  @IsUUID()
  transactionId: string;

  @IsString()
  reason: string;
}
