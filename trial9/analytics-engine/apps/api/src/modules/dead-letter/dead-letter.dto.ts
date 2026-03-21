import { IsString, IsObject } from 'class-validator';

export class CreateDeadLetterDto {
  @IsString()
  dataSourceId!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsString()
  errorReason!: string;
}
