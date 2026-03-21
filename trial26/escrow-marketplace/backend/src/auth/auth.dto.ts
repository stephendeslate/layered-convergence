// [TRACED:EM-006] BUYER and SELLER roles, ADMIN excluded
// [TRACED:EM-021] @IsIn allowing BUYER and SELLER only
// [TRACED:EM-028] Role restriction for self-registration
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

  @IsIn(["BUYER", "SELLER"], {
    message: "Role must be BUYER or SELLER",
  })
  role: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
