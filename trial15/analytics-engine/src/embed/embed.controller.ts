import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('embeds')
@UseGuards(AuthGuard)
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  private getTenantId(req: Request): string {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    return tenantId;
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateEmbedConfigDto) {
    return this.embedService.create(this.getTenantId(req), dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.embedService.findAll(this.getTenantId(req));
  }

  @Get('by-token')
  findByToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token query parameter is required');
    }
    return this.embedService.findByToken(token);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.embedService.findOne(this.getTenantId(req), id);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateEmbedConfigDto,
  ) {
    return this.embedService.update(this.getTenantId(req), id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.embedService.remove(this.getTenantId(req), id);
  }
}
