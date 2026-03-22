import { IsString, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
