import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateKeyDto {
  @IsString()
  @IsNotEmpty()
  apiKey!: string;
}
