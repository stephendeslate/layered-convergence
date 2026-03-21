import { IsEnum } from 'class-validator';
import { OnboardingStatus } from '../../../generated/prisma/enums.js';

export class UpdateStatusDto {
  @IsEnum(OnboardingStatus)
  onboardingStatus!: OnboardingStatus;
}
