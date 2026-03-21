import { IsString } from 'class-validator';

export class CreateStripeAccountDto {
  @IsString()
  stripeAccountId: string;
}
