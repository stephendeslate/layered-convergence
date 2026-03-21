import { IsString, IsOptional, IsInt, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdatePartDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  partNumber?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitCost?: number;

  @IsBoolean()
  @IsOptional()
  installed?: boolean;
}
