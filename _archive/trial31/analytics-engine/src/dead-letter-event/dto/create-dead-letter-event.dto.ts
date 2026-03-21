import { IsString, IsOptional } from 'class-validator';

export class CreateDeadLetterEventDto {
  @IsString()
  dataSourceId!: string;

  @IsOptional()
  payload?: Record<string, unknown>;

  @IsString()
  errorReason!: string;
}
