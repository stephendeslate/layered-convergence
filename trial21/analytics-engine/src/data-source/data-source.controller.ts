import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateDataSourceDto } from './dto/create-data-source.dto';

@Controller('data-sources')
@UseGuards(JwtAuthGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.dataSourceService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataSourceService.findById(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() dto: CreateDataSourceDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataSourceService.create(dto, req.user.tenantId);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataSourceService.delete(id, req.user.tenantId);
  }
}
