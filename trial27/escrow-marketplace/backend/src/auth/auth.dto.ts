// [TRACED:EM-002] Role validation excluding ADMIN from self-registration
import { IsEmail, IsString, MinLength, IsIn } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsIn(["BUYER", "SELLER", "ARBITER"], {
    message: "Role must be one of: BUYER, SELLER, ARBITER",
  })
  role: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
