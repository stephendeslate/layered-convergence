import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { ListingStatus } from '@escrow-marketplace/shared';

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
  @MaxLength(50)
  status?: ListingStatus;
}
