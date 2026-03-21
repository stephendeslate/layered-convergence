import { IsString } from 'class-validator';

export class TriggerPipelineDto {
  @IsString()
  dataSourceId: string;
}
