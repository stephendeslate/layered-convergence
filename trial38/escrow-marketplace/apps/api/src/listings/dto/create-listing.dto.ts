import {
  IsString,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';

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
