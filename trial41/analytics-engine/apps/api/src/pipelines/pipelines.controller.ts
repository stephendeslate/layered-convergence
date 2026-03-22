// TRACED:AE-PIPELINES-CONTROLLER
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Header,
} from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { CACHE_CONTROL_LIST } from '@analytics-engine/shared';

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePipelineDto) {
    return this.pipelinesService.create(user.tenantId, dto);
  }

  @Get()
  @Header('Cache-Control', CACHE_CONTROL_LIST)
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.pipelinesService.findAll(
      user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.pipelinesService.findOne(id, user.tenantId);
  }

  @Put(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.pipelinesService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.pipelinesService.remove(id, user.tenantId);
  }
}
