import { IsUUID } from 'class-validator';

export class OnboardProviderDto {
  @IsUUID()
  userId: string;
}
