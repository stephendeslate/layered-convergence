// [TRACED:AE-002] Role validation excluding ADMIN from self-registration
import { IsEmail, IsString, MinLength, IsIn } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsIn(["VIEWER", "EDITOR", "ANALYST"], {
    message: "Role must be one of: VIEWER, EDITOR, ANALYST",
  })
  role: string;

  @IsString()
  tenantId: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
