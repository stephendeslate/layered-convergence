import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('embeds')
@UseGuards(JwtAuthGuard)
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post()
  create(
    @Body() body: { dashboardId: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.embedService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.embedService.findAll(req.user.tenantId);
  }

  @Get('token/:token')
  findByToken(@Param('token') token: string) {
    return this.embedService.findByToken(token);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.embedService.findOne(id, req.user.tenantId);
  }

  @Put(':id/deactivate')
  deactivate(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.embedService.deactivate(id, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.embedService.remove(id, req.user.tenantId);
  }
}
