import { IsString, IsNumber, IsOptional, IsIn, MaxLength, Min } from 'class-validator';

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
  @IsNumber()
  @Min(0.01)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['ACTIVE', 'SOLD', 'CANCELLED', 'SUSPENDED'])
  status?: string;
}
