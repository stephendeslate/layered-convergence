import { IsString, MaxLength, IsNumber, IsArray } from 'class-validator';

export class CreateServiceAreaDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsArray()
  @IsString({ each: true })
  zipCodes!: string[];

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsNumber()
  radius!: number;
}
