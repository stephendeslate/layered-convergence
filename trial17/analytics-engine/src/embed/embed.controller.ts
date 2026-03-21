import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { EmbedService } from './embed.service';
import { CreateEmbedDto, UpdateEmbedDto } from './embed.dto';

@Controller('embeds')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post()
  async create(
    @Req() req: Request & { tenantId: string },
    @Body() dto: CreateEmbedDto,
  ) {
    return this.embedService.create(req.tenantId, dto);
  }

  @Get()
  async findAll(@Req() req: Request & { tenantId: string }) {
    return this.embedService.findAll(req.tenantId);
  }

  @Get('public/:token')
  async findByToken(@Param('token') token: string) {
    return this.embedService.findByToken(token);
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.embedService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateEmbedDto,
  ) {
    return this.embedService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.embedService.remove(req.tenantId, id);
  }
}
