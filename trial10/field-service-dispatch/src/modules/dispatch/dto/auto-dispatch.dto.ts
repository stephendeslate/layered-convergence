import { IsString, IsOptional, IsArray } from 'class-validator';

export class AutoDispatchDto {
  @IsString()
  workOrderId!: string;

  @IsOptional()
  @IsArray()
  requiredSkills?: string[];
}
