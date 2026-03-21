import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { UpdateThemeDto } from './dto/theme-config.dto';

@Controller('themes')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get(':tenantId')
  getTheme(@Param('tenantId') tenantId: string) {
    return this.themeService.getTheme(tenantId);
  }

  @Put(':tenantId')
  updateTheme(@Param('tenantId') tenantId: string, @Body() dto: UpdateThemeDto) {
    return this.themeService.updateTheme(tenantId, dto);
  }
}
