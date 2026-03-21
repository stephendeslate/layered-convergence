// [TRACED:FD-015] Users with bcrypt salt 12
// [TRACED:FD-030] bcrypt salt round 12
import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../common/prisma.service";
import { RegisterDto, LoginDto } from "./auth.dto";

// [TRACED:SEC-003] Auth service with bcrypt salt 12
@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // findFirst justified: checking uniqueness by email before insert
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role as "DISPATCHER" | "TECHNICIAN",
        companyId: dto.companyId,
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    return { accessToken: token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async login(dto: LoginDto) {
    // findFirst justified: looking up user by unique email for authentication
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    return { accessToken: token, user: { id: user.id, email: user.email, role: user.role } };
  }
}
