// TRACED: EM-LDTO-001
import {
  IsString,
  MaxLength,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  IsInt,
} from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}

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
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['DRAFT', 'ACTIVE', 'SOLD', 'CANCELLED'])
  status?: string;
}

export class ListingQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
