import { IsString, IsNotEmpty } from 'class-validator';

export class TrackingTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
