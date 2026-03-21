import { IsUUID } from 'class-validator';

export class CreatePayoutDto {
  @IsUUID()
  transactionId: string;
}
