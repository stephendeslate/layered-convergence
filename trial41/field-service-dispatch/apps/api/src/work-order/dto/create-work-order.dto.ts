import {
  IsString,
  MaxLength,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  priority!: number;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  technicianId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
