import { IsString, IsOptional, IsArray } from 'class-validator';

export class AutoAssignDto {
  @IsString()
  workOrderId!: string;

  @IsOptional()
  @IsArray()
  requiredSkills?: string[];
}
