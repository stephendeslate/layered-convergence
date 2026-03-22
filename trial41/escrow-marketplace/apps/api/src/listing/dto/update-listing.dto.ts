import { IsString, MaxLength, IsNumber, Min, IsOptional, IsIn } from 'class-validator';

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['ACTIVE', 'SOLD', 'CANCELLED', 'SUSPENDED'])
  status?: string;
}
