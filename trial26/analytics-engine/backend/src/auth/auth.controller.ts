// [TRACED:AE-021] Registration endpoint with @IsIn excluding ADMIN
import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
