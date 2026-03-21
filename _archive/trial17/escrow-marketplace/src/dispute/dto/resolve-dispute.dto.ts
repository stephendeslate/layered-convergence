import { IsEnum } from 'class-validator';
import { DisputeResolution } from '../../../generated/prisma/enums.js';

export class ResolveDisputeDto {
  @IsEnum(DisputeResolution)
  resolution!: DisputeResolution;
}
