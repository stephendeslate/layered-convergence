// TRACED: EM-API-011 — Escrows controller with full CRUD
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
import { EscrowsService } from './escrows.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { UpdateEscrowDto } from './dto/update-escrow.dto';
import { normalizePageParams, DEFAULT_PAGE_SIZE } from '@escrow-marketplace/shared';

@Controller('escrows')
@UseGuards(JwtAuthGuard)
export class EscrowsController {
  constructor(private readonly escrowsService: EscrowsService) {}

  @Post()
  create(@Body() dto: CreateEscrowDto) {
    return this.escrowsService.create(dto);
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

    return this.escrowsService.findAll(tenantId, page, pageSize);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.escrowsService.findOne(id, tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: UpdateEscrowDto,
  ) {
    return this.escrowsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.escrowsService.remove(id, tenantId);
  }
}
