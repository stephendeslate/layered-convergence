import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDeadLetterEventDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  payload!: any;

  @IsString()
  @IsNotEmpty()
  errorReason!: string;
}
