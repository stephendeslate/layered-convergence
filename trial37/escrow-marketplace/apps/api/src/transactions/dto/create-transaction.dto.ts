import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsUUID()
  @MaxLength(36)
  listingId!: string;
}
