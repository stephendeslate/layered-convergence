import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDeadLetterEventDto {
  @IsString()
  @MinLength(1)
  sourceType!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsString()
  @MinLength(1)
  errorReason!: string;
}
