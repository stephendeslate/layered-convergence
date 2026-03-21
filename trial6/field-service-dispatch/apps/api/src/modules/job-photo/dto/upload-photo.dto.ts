import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class UploadPhotoDto {
  @IsString()
  @IsNotEmpty()
  workOrderId: string;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
