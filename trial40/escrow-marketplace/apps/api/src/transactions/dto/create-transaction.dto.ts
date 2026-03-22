// TRACED: EM-API-006 — Transaction DTO with UUID MaxLength validation
import { IsString, IsNumber, MaxLength, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @MaxLength(36)
  buyerId!: string;

  @IsString()
  @MaxLength(36)
  sellerId!: string;

  @IsString()
  @MaxLength(36)
  listingId!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
