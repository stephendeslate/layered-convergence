import { IsString, IsOptional } from 'class-validator';

export class CreateJobPhotoDto {
  @IsString()
  workOrderId!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
