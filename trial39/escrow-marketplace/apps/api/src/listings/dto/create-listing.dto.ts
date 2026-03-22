// TRACED: EM-API-003 — Listing DTO with string validation and MaxLength
import { IsString, IsNumber, MaxLength, Min } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MaxLength(100)
  title!: string;

  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsNumber()
  @Min(0.01)
  price!: number;

  @IsString()
  @MaxLength(36)
  sellerId!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
