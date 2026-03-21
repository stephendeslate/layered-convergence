import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OnboardingStatus } from '../../../generated/prisma/enums.js';

export class CreateStripeAccountDto {
  @IsUUID()
  userId!: string;

  @IsString()
  stripeAccountId!: string;

  @IsOptional()
  @IsEnum(OnboardingStatus)
  onboardingStatus?: OnboardingStatus;
}
