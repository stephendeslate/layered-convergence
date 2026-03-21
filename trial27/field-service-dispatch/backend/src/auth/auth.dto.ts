// [TRACED:FD-002] Role validation excluding ADMIN from self-registration
import { IsEmail, IsNotEmpty, IsString, IsIn } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsIn(["DISPATCHER", "TECHNICIAN", "MANAGER"])
  role: string;

  @IsNotEmpty()
  @IsString()
  companyId: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
