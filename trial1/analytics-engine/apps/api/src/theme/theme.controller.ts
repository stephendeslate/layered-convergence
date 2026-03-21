import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { ThemeService } from './theme.service';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Controller('api/theme')
@UseGuards(JwtAuthGuard)
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get()
  async getTheme(@CurrentTenant() tenantId: string) {
    const data = await this.themeService.getTenantTheme(tenantId);
    return { data };
  }

  @Patch()
  async updateTheme(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateThemeDto,
  ) {
    const data = await this.themeService.updateTenantTheme(tenantId, dto);
    return { data };
  }
}

/**
 * Public embed theme endpoint (API key auth).
 */
@Controller('api/embed-theme')
@UseGuards(ApiKeyAuthGuard)
export class EmbedThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get(':embedId')
  async getEmbedTheme(@Param('embedId') embedId: string) {
    const theme = await this.themeService.getEmbedTheme(embedId);
    const css = this.themeService.generateCssVariables(theme);
    return { data: { theme, css } };
  }
}
