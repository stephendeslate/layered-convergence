import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DataSourceService } from './data-source.service';

// [TRACED:API-007] JwtAuthGuard on all protected endpoints
@Controller('data-sources')
@UseGuards(JwtAuthGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.dataSourceService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dataSourceService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() body: { name: string; type: 'POSTGRESQL' | 'MYSQL' | 'REST_API' | 'CSV' | 'S3_BUCKET'; connectionUri: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataSourceService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; isActive?: boolean },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataSourceService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dataSourceService.remove(id, req.user.tenantId);
  }
}
