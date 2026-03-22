// TRACED: EM-API-013 — Disputes controller with full CRUD
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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { normalizePageParams, DEFAULT_PAGE_SIZE } from '@escrow-marketplace/shared';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  create(@Body() dto: CreateDisputeDto) {
    return this.disputesService.create(dto);
  }

  @Get()
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') rawPage: string,
    @Query('pageSize') rawPageSize: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, pageSize } = normalizePageParams(
      parseInt(rawPage, 10) || 1,
      parseInt(rawPageSize, 10) || DEFAULT_PAGE_SIZE,
    );

    res.setHeader('Cache-Control', 'private, max-age=10');

    return this.disputesService.findAll(tenantId, page, pageSize);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.disputesService.findOne(id, tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: UpdateDisputeDto,
  ) {
    return this.disputesService.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.disputesService.remove(id, tenantId);
  }
}
