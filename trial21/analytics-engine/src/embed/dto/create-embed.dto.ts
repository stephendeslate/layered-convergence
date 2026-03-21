import { IsString, IsDateString } from 'class-validator';

export class CreateEmbedDto {
  @IsString()
  dashboardId!: string;

  @IsDateString()
  expiresAt!: string;
}
