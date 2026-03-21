import { IsString, IsNotEmpty } from 'class-validator';

export class OnboardingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class ConnectedAccountDto {
  userId: string;
  stripeAccountId: string;
  onboardingStatus: string;
}
