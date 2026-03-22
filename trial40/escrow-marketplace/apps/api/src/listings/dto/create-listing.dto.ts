// TRACED: EM-API-003 — Listing DTO with string and UUID validation
import { IsString, IsNumber, MaxLength, Min } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2000)
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
