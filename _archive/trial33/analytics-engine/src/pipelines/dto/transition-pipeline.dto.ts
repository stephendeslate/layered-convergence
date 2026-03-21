import { IsEnum } from 'class-validator';
import { PipelineStatus } from '@prisma/client';

export class TransitionPipelineDto {
  @IsEnum(PipelineStatus)
  status!: PipelineStatus;
}
