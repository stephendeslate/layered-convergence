import { IsString, IsNotEmpty } from 'class-validator';

export class RetryDeadLetterDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
