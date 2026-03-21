import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string) {
    const technician = await this.prisma.technician.findFirstOrThrow({
      where: { email },
      include: { company: true },
    });
    return {
      technicianId: technician.id,
      companyId: technician.companyId,
      name: technician.name,
    };
  }
}
