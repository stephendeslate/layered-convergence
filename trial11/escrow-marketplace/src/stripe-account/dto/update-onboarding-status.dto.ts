import { IsEnum } from 'class-validator';
import { OnboardingStatus } from '../../../generated/prisma/client.js';

export class UpdateOnboardingStatusDto {
  @IsEnum(OnboardingStatus)
  onboardingStatus: OnboardingStatus;
}
