import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, RefreshTokenDto, RequestMagicLinkDto, VerifyMagicLinkDto } from './dto';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const MAGIC_LINK_EXPIRY_HOURS = 24;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email is already used
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const slug = dto.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existingCompany = await this.prisma.company.findUnique({
      where: { slug },
    });

    if (existingCompany) {
      throw new ConflictException('Company name already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const company = await this.prisma.company.create({
      data: {
        name: dto.companyName,
        slug,
        email: dto.email,
        users: {
          create: {
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: 'ADMIN',
            phone: dto.phone,
          },
        },
      },
      include: { users: true },
    });

    const user = company.users[0];
    return this.generateTokens(user.id, company.id, user.role, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, isActive: true },
      include: { company: { select: { id: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.companyId, user.role, user.email);
  }

  async refresh(dto: RefreshTokenDto) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: {
        user: {
          select: { id: true, companyId: true, role: true, email: true, isActive: true },
        },
      },
    });

    if (!token || token.revokedAt || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!token.user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Revoke old refresh token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: token.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(
      token.user.id,
      token.user.companyId,
      token.user.role,
      token.user.email,
    );
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async requestMagicLink(dto: RequestMagicLinkDto) {
    const company = await this.prisma.company.findUnique({
      where: { slug: dto.companySlug },
    });

    if (!company) {
      // Don't reveal company doesn't exist
      return { message: 'If the email is registered, a magic link has been sent.' };
    }

    const customer = await this.prisma.customer.findUnique({
      where: {
        companyId_email: { companyId: company.id, email: dto.email },
      },
    });

    if (!customer) {
      return { message: 'If the email is registered, a magic link has been sent.' };
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + MAGIC_LINK_EXPIRY_HOURS);

    await this.prisma.magicLink.create({
      data: {
        customerId: customer.id,
        token,
        expiresAt,
      },
    });

    // TODO: Send email with magic link via notification queue
    this.logger.log(`Magic link generated for customer ${customer.id}: ${token}`);

    return { message: 'If the email is registered, a magic link has been sent.' };
  }

  async verifyMagicLink(dto: VerifyMagicLinkDto) {
    const magicLink = await this.prisma.magicLink.findUnique({
      where: { token: dto.token },
      include: {
        customer: {
          include: { company: { select: { id: true } } },
        },
      },
    });

    if (!magicLink || magicLink.usedAt || magicLink.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    // Mark as used
    await this.prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    });

    const payload = {
      sub: magicLink.customer.id,
      companyId: magicLink.customer.companyId,
      role: 'CUSTOMER',
      email: magicLink.customer.email,
    };

    const expiresIn = parseInt(process.env.JWT_EXPIRY ?? '86400', 10) || 86400;
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      accessToken,
      expiresIn,
      type: 'customer',
    };
  }

  private async generateTokens(
    userId: string,
    companyId: string,
    role: string,
    email: string,
  ) {
    const payload = { sub: userId, companyId, role, email };

    const expiresIn = parseInt(process.env.JWT_EXPIRY ?? '86400', 10) || 86400;
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24h in seconds
    };
  }
}
