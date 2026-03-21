import { IsUUID } from 'class-validator';

export class CreatePipelineRunDto {
  @IsUUID()
  pipelineId!: string;
}
