import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TenantsService } from '../tenants/tenants.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.tenant.findFirst({
      where: { name: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let tenantId = dto.tenantId;
    if (!tenantId) {
      const tenant = await this.tenantsService.create({ name: dto.name });
      tenantId = tenant.id;
    }

    const token = this.generateToken({
      id: tenantId,
      email: dto.email,
      role: dto.role ?? 'ADMIN',
      tenantId,
    });

    return {
      user: { id: tenantId, email: dto.email, name: dto.name, role: dto.role ?? 'ADMIN' },
      tenantId,
      token,
    };
  }

  async login(dto: LoginDto) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { apiKey: dto.email },
    });
    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken({
      id: tenant.id,
      email: dto.email,
      role: 'ADMIN',
      tenantId: tenant.id,
    });

    return {
      user: { id: tenant.id, email: dto.email, name: tenant.name, role: 'ADMIN' },
      tenantId: tenant.id,
      token,
    };
  }

  private generateToken(user: { id: string; email: string; role: string; tenantId: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    return this.jwtService.sign(payload);
  }
}
