// [TRACED:AC-008] DataSource controller with JWT-protected endpoints

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthRequest {
  user: { sub: string; tenantId: string; role: string };
}

@Controller('data-sources')
@UseGuards(JwtAuthGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.dataSourceService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.dataSourceService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() body: { name: string; type: string; config?: object },
    @Request() req: AuthRequest,
  ) {
    return this.dataSourceService.create({
      ...body,
      tenantId: req.user.tenantId,
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; type?: string; config?: object },
    @Request() req: AuthRequest,
  ) {
    return this.dataSourceService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.dataSourceService.remove(id, req.user.tenantId);
  }
}
