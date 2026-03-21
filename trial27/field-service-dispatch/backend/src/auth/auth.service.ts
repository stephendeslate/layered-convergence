// [TRACED:FD-026] bcrypt password hashing with salt round 12
// [TRACED:FD-027] Credential validation with secure comparison
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../common/prisma.service";
import { RegisterDto, LoginDto } from "./auth.dto";
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role as "DISPATCHER" | "TECHNICIAN" | "MANAGER",
        companyId: dto.companyId,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: LoginDto) {
    // findFirst: lookup by email for credential validation
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return { accessToken: token };
  }
}
