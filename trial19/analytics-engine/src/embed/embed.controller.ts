import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedDto, UpdateEmbedDto } from './embed.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('embeds')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.embedService.findAll(req.tenantId);
  }

  @Get('public/:token')
  async findByToken(@Param('token') token: string) {
    return this.embedService.findByToken(token);
  }

  @Get(':id')
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.embedService.findOne(req.tenantId, id);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateEmbedDto) {
    return this.embedService.create(req.tenantId, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateEmbedDto,
  ) {
    return this.embedService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.embedService.remove(req.tenantId, id);
  }
}
