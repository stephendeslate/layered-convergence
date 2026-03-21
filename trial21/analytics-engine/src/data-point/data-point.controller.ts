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
import { DataPointService } from './data-point.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateDataPointDto } from './dto/create-data-point.dto';

@Controller('data-points')
@UseGuards(JwtAuthGuard)
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Get('by-source/:dataSourceId')
  findByDataSource(
    @Param('dataSourceId') dataSourceId: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataPointService.findByDataSource(dataSourceId, req.user.tenantId);
  }

  @Post()
  create(
    @Body() dto: CreateDataPointDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataPointService.create(dto, req.user.tenantId);
  }

  @Delete('by-source/:dataSourceId')
  deleteByDataSource(
    @Param('dataSourceId') dataSourceId: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataPointService.deleteByDataSource(dataSourceId, req.user.tenantId);
  }
}
