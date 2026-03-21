// [TRACED:FD-006] DISPATCHER and TECHNICIAN roles, ADMIN excluded
// [TRACED:FD-023] @IsIn allowing DISPATCHER and TECHNICIAN only
// [TRACED:FD-031] Role restriction for self-registration
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

  @IsIn(["DISPATCHER", "TECHNICIAN"], {
    message: "Role must be DISPATCHER or TECHNICIAN",
  })
  role: string;

  @IsString()
  companyId: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
