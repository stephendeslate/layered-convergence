// TRACED: FD-SA-004 — Service areas REST controller with full CRUD
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Header,
} from '@nestjs/common';
import { ServiceAreasService } from './service-areas.service';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { normalizePageParams, DEFAULT_PAGE_SIZE } from '@field-service-dispatch/shared';

@Controller('service-areas')
@UseGuards(JwtAuthGuard)
export class ServiceAreasController {
  constructor(private readonly serviceAreasService: ServiceAreasService) {}

  @Post()
  async create(
    @Request() req: { user: { tenantId: string } },
    @Body() dto: CreateServiceAreaDto,
  ) {
    return this.serviceAreasService.create(req.user.tenantId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
  async findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params = normalizePageParams(
      Number(page) || 1,
      Number(pageSize) || DEFAULT_PAGE_SIZE,
    );
    return this.serviceAreasService.findAll(
      req.user.tenantId,
      params.page,
      params.pageSize,
    );
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    return this.serviceAreasService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateServiceAreaDto,
  ) {
    return this.serviceAreasService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    return this.serviceAreasService.remove(req.user.tenantId, id);
  }
}
