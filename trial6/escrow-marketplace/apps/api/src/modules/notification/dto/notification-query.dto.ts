import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class NotificationQueryDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean;
}
