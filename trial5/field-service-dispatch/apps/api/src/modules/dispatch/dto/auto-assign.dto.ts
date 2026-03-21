import { IsUUID, IsOptional, IsArray, IsString } from 'class-validator';

export class AutoAssignDto {
  @IsUUID()
  workOrderId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];
}
