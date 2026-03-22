// TRACED: AE-API-04
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { paginate } from '@analytics-engine/shared';

interface AuthenticatedRequest {
  user: { id: string; tenantId: string; email: string; role: string };
}

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreatePipelineDto) {
    return this.pipelinesService.create(req.user.tenantId, req.user.id, dto);
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const { items, total } = await this.pipelinesService.findAll(
      req.user.tenantId,
    );
    return paginate(items, total, {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const pipeline = await this.pipelinesService.findOne(id, req.user.tenantId);
    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }
    return pipeline;
  }

  @Patch(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    const pipeline = await this.pipelinesService.findOne(id, req.user.tenantId);
    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }
    return this.pipelinesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const pipeline = await this.pipelinesService.findOne(id, req.user.tenantId);
    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }
    return this.pipelinesService.remove(id);
  }
}
