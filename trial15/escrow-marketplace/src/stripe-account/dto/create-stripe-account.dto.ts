import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStripeAccountDto {
  @IsString()
  @IsNotEmpty()
  stripeAccountId!: string;
}
