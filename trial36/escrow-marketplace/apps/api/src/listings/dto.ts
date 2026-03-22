import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { ListingStatus } from '@escrow-marketplace/shared';

// TRACED: EM-API-006 — DTO validation on all input
export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price!: number;
}

export class UpdateListingDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0.01)
  price?: number;

  @IsEnum(ListingStatus)
  @IsOptional()
  status?: ListingStatus;
}
