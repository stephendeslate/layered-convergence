import { IsString, IsEnum, MinLength, MaxLength } from 'class-validator';

export enum DisputeResolutionAction {
  RELEASE = 'RELEASE',
  REFUND = 'REFUND',
  ESCALATE = 'ESCALATE',
}

export class ResolveDisputeDto {
  @IsEnum(DisputeResolutionAction)
  action: DisputeResolutionAction;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  note: string;
}
