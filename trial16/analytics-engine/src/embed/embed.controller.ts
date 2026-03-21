import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedDto, UpdateEmbedDto } from './embed.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('embeds')
@UseGuards(AuthGuard)
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateEmbedDto) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.embedService.create(tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.embedService.findAll(tenantId);
  }

  @Get('public/:token')
  findByToken(@Param('token') token: string) {
    return this.embedService.findByToken(token);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.embedService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateEmbedDto,
  ) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.embedService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.embedService.remove(tenantId, id);
  }
}
