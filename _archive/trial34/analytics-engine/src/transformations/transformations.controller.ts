import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TransformationsService } from './transformations.service';
import { CreateTransformationDto } from './dto/create-transformation.dto';
import { UpdateTransformationDto } from './dto/update-transformation.dto';

@Controller('transformations')
export class TransformationsController {
  constructor(
    private readonly transformationsService: TransformationsService,
  ) {}

  @Get()
  findAll(@Query('dataSourceId') dataSourceId: string) {
    return this.transformationsService.findAll(dataSourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transformationsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTransformationDto) {
    return this.transformationsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTransformationDto) {
    return this.transformationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transformationsService.remove(id);
  }
}
