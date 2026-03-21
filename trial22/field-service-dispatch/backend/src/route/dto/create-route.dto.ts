import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  date!: string;

  @IsUUID()
  technicianId!: string;

  @IsNumber()
  @Min(0)
  estimatedDistance!: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  workOrderIds?: string[];
}
