import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsIn(['ADMIN', 'EMBED'])
  type?: 'ADMIN' | 'EMBED';

  @IsOptional()
  @IsString()
  expiresAt?: string;
}
