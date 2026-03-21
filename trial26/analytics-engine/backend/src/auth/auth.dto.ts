// [TRACED:AE-002] Role-based access with ADMIN, VIEWER, EDITOR, ANALYST
// [TRACED:AE-027] @IsIn excluding ADMIN for self-registration
import { IsEmail, IsString, MinLength, IsIn } from "class-validator";

// [TRACED:SEC-002] @IsIn excludes ADMIN from self-registration
export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(["VIEWER", "EDITOR", "ANALYST"], {
    message: "Role must be VIEWER, EDITOR, or ANALYST",
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
