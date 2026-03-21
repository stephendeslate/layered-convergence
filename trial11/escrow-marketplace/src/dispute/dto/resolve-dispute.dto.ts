import { IsEnum } from 'class-validator';
import { DisputeResolution } from '../../../generated/prisma/client.js';

export class ResolveDisputeDto {
  @IsEnum(DisputeResolution)
  resolution: DisputeResolution;
}
