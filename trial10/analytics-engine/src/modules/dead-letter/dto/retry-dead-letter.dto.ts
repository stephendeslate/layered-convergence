import { IsString } from 'class-validator';

export class RetryDeadLetterDto {
  @IsString()
  id!: string;
}
