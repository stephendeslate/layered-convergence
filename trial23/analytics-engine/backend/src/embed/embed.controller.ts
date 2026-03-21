import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('embeds')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() body: { dashboardId: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.embedService.create({ ...body, tenantId: req.user.tenantId });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.embedService.findAll(req.user.tenantId);
  }

  @Get('token/:token')
  findByToken(@Param('token') token: string) {
    return this.embedService.findByToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.embedService.findOne(id, req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { isActive?: boolean },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.embedService.update(id, req.user.tenantId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.embedService.remove(id, req.user.tenantId);
  }
}
