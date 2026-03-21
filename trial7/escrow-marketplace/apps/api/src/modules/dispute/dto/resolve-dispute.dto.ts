import { IsEnum } from 'class-validator';
import { DisputeResolution } from '@prisma/client';

export class ResolveDisputeDto {
  @IsEnum(DisputeResolution)
  resolution!: DisputeResolution;
}
