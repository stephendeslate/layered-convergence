import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateDeadLetterEventDto {
  @IsString()
  dataSourceId!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsString()
  errorReason!: string;
}
