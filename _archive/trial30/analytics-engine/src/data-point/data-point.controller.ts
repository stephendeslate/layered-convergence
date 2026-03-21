import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';

@Controller('data-points')
export class DataPointController {
  constructor(private readonly dataPointService: DataPointService) {}

  @Post()
  create(@Body() dto: CreateDataPointDto) {
    return this.dataPointService.create(dto);
  }

  @Post('batch')
  createMany(@Body() dtos: CreateDataPointDto[]) {
    return this.dataPointService.createMany(dtos);
  }

  @Get()
  findAll(@Query('dataSourceId') dataSourceId?: string) {
    return this.dataPointService.findAll(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataPointService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataPointService.remove(id);
  }
}
