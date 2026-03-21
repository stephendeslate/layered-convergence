import { IsEnum } from 'class-validator';
import { PipelineState } from '@prisma/client';

export class TransitionPipelineDto {
  @IsEnum(PipelineState)
  state!: PipelineState;
}
