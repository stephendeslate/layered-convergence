import { IsInt, Min } from 'class-validator';

export class CompletePipelineRunDto {
  @IsInt()
  @Min(0)
  rowsIngested!: number;
}
