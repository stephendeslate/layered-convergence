import { IsEmail, IsString } from 'class-validator';

export class RequestMagicLinkDto {
  @IsEmail()
  email!: string;

  @IsString()
  companySlug!: string;
}

export class VerifyMagicLinkDto {
  @IsString()
  token!: string;
}
