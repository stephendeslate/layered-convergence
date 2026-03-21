import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OnboardingStatus } from '../../../generated/prisma/enums.js';

export class UpdateStripeAccountDto {
  @IsOptional()
  @IsString()
  stripeAccountId?: string;

  @IsOptional()
  @IsEnum(OnboardingStatus)
  onboardingStatus?: OnboardingStatus;
}
