import { IsString, IsNumber, IsOptional, IsIn, MaxLength, Min } from 'class-validator';

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
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
