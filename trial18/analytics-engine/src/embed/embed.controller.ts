import { Controller, Get, Post, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedDto, UpdateEmbedDto } from './embed.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('embeds')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.embedService.findAll(req.tenantId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.embedService.findOne(req.tenantId, id);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateEmbedDto) {
    return this.embedService.create(req.tenantId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateEmbedDto,
  ) {
    return this.embedService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.embedService.remove(req.tenantId, id);
  }
}
