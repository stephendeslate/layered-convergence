// TRACED: EM-API-001 — All list endpoints enforce MAX_PAGE_SIZE via normalizePageParams
// TRACED: EM-API-005 — Listings controller with full CRUD
// TRACED: EM-PERF-006 — Cache-Control headers for list endpoints
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
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { normalizePageParams, DEFAULT_PAGE_SIZE } from '@escrow-marketplace/shared';

@Controller('listings')
@UseGuards(JwtAuthGuard)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  create(@Body() dto: CreateListingDto) {
    return this.listingsService.create(dto);
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

    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');

    return this.listingsService.findAll(tenantId, page, pageSize);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.listingsService.findOne(id, tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.listingsService.remove(id, tenantId);
  }
}
