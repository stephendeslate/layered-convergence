import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('embeds')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: { user: { tenantId: string } }, @Param('dashboardId') dashboardId: string) {
    return this.embedService.create({ dashboardId, tenantId: req.user.tenantId });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.embedService.findAll(req.user.tenantId);
  }

  @Get('token/:token')
  findByToken(@Param('token') token: string) {
    return this.embedService.findByToken(token);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.embedService.findOne(id, req.user.tenantId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.embedService.remove(id, req.user.tenantId);
  }
}
