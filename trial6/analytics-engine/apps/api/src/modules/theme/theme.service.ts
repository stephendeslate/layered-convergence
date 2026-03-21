import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateThemeDto } from './dto/theme-config.dto';

@Injectable()
export class ThemeService {
  constructor(private readonly prisma: PrismaService) {}

  async getTheme(tenantId: string) {
    const tenant = await this.prisma.tenant.findFirstOrThrow({
      where: { id: tenantId },
      select: {
        id: true,
        primaryColor: true,
        fontFamily: true,
        logoUrl: true,
      },
    });

    return {
      tenantId: tenant.id,
      cssVariables: {
        '--primary-color': tenant.primaryColor,
        '--font-family': tenant.fontFamily,
        '--logo-url': tenant.logoUrl ? `url(${tenant.logoUrl})` : 'none',
      },
    };
  }

  async updateTheme(tenantId: string, dto: UpdateThemeDto) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: dto,
    });
  }
}
