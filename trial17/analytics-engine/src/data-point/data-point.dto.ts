import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDataPointDto {
  @IsUUID()
  dataSourceId!: string;

  @IsString()
  @IsNotEmpty()
  metric!: string;

  @IsNumber()
  value!: number;

  @IsOptional()
  @IsObject()
  dimensions?: Record<string, unknown>;

  @IsDateString()
  timestamp!: string;
}

export class CreateDataPointBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDataPointDto)
  dataPoints!: CreateDataPointDto[];
}

export class QueryDataPointsDto {
  @IsOptional()
  @IsUUID()
  dataSourceId?: string;

  @IsOptional()
  @IsString()
  metric?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
