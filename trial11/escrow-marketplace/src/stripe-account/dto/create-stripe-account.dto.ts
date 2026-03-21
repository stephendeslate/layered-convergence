import { IsString, MinLength } from 'class-validator';

export class CreateStripeAccountDto {
  @IsString()
  @MinLength(1)
  stripeAccountId: string;
}
