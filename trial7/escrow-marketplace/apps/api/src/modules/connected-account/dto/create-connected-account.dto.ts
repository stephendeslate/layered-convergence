import { IsString } from 'class-validator';

export class CreateConnectedAccountDto {
  @IsString()
  stripeAccountId!: string;
}
