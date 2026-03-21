import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateThemeDto } from './dto/update-theme.dto';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  cornerRadius: number;
  logoUrl: string | null;
}

@Injectable()
export class ThemeService {
  private readonly logger = new Logger(ThemeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Get the theme configuration for a tenant.
   */
  async getTenantTheme(tenantId: string): Promise<ThemeConfig> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        textColor: true,
        fontFamily: true,
        cornerRadius: true,
        logoUrl: true,
      },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  /**
   * Update the tenant's theme configuration.
   */
  async updateTenantTheme(
    tenantId: string,
    dto: UpdateThemeDto,
  ): Promise<ThemeConfig> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const changedFields: string[] = [];
    const updateData: Record<string, unknown> = {};

    if (dto.primaryColor !== undefined) {
      updateData.primaryColor = dto.primaryColor;
      changedFields.push('primaryColor');
    }
    if (dto.secondaryColor !== undefined) {
      updateData.secondaryColor = dto.secondaryColor;
      changedFields.push('secondaryColor');
    }
    if (dto.backgroundColor !== undefined) {
      updateData.backgroundColor = dto.backgroundColor;
      changedFields.push('backgroundColor');
    }
    if (dto.textColor !== undefined) {
      updateData.textColor = dto.textColor;
      changedFields.push('textColor');
    }
    if (dto.fontFamily !== undefined) {
      updateData.fontFamily = dto.fontFamily;
      changedFields.push('fontFamily');
    }
    if (dto.cornerRadius !== undefined) {
      updateData.cornerRadius = dto.cornerRadius;
      changedFields.push('cornerRadius');
    }
    if (dto.logoUrl !== undefined) {
      updateData.logoUrl = dto.logoUrl;
      changedFields.push('logoUrl');
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: updateData as any,
      select: {
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        textColor: true,
        fontFamily: true,
        cornerRadius: true,
        logoUrl: true,
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'THEME_UPDATED' as any,
      resourceType: 'Tenant',
      resourceId: tenantId,
      metadata: { changedFields },
    });

    return updated;
  }

  /**
   * Get the merged theme for an embed configuration.
   * Merges tenant base theme with any embed-level overrides.
   * (Currently, embeds use the tenant theme directly.)
   */
  async getEmbedTheme(embedId: string): Promise<ThemeConfig> {
    const embed = await this.prisma.embedConfig.findUnique({
      where: { id: embedId },
      select: { tenantId: true },
    });

    if (!embed) throw new NotFoundException('Embed config not found');

    return this.getTenantTheme(embed.tenantId);
  }

  /**
   * Convert a theme configuration to CSS custom properties string.
   * Used by the embed renderer for dynamic theming.
   */
  generateCssVariables(theme: ThemeConfig): string {
    const vars = [
      `--ae-primary-color: ${theme.primaryColor};`,
      `--ae-secondary-color: ${theme.secondaryColor};`,
      `--ae-background-color: ${theme.backgroundColor};`,
      `--ae-text-color: ${theme.textColor};`,
      `--ae-font-family: ${theme.fontFamily}, sans-serif;`,
      `--ae-corner-radius: ${theme.cornerRadius}px;`,
    ];

    if (theme.logoUrl) {
      vars.push(`--ae-logo-url: url('${theme.logoUrl}');`);
    }

    return `:root {\n  ${vars.join('\n  ')}\n}`;
  }
}
