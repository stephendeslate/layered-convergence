import { IsEnum } from 'class-validator';

export enum DisputeResolution {
  REFUNDED = 'REFUNDED',
  RELEASED = 'RELEASED',
}

export class ResolveDisputeDto {
  @IsEnum(DisputeResolution)
  resolution: DisputeResolution;
}
