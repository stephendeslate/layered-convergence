// [TRACED:AE-026] bcrypt password hashing with salt round 12
// [TRACED:AE-027] @IsIn excluding ADMIN from self-registration
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../common/prisma.service";
import { RegisterDto, LoginDto } from "./auth.dto";

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hashedPassword,
        role: dto.role as "VIEWER" | "EDITOR" | "ANALYST",
        tenantId: dto.tenantId,
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });

    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  async login(dto: LoginDto) {
    // findFirst: login requires email lookup which may not be unique across soft-deleted records
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });

    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }
}
