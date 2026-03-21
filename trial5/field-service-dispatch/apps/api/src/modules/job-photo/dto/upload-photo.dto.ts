import { IsUUID, IsString, IsOptional, IsUrl } from 'class-validator';

export class UploadPhotoDto {
  @IsUUID()
  workOrderId: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
