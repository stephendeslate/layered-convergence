import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateJobPhotoDto {
  @IsString()
  workOrderId!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
