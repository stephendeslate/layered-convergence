import { IsString } from 'class-validator';

export class CreateStripeAccountDto {
  @IsString()
  userId!: string;
}

export class OnboardingCallbackDto {
  @IsString()
  stripeAccountId!: string;
}
