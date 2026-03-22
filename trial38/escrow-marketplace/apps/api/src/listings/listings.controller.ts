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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { clampPageSize } from '@escrow-marketplace/shared';

interface AuthenticatedRequest {
  user: { sub: string; role: string; tenantId: string };
}

@Controller('listings')
@UseGuards(JwtAuthGuard)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  // TRACED: EM-PERF-004 — Cache-Control headers on list endpoints
  // TRACED: EM-PERF-002 — clampPageSize used by controllers for pagination safety
  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const clampedPageSize = clampPageSize(
      pageSize ? parseInt(pageSize, 10) : 20,
    );
    res?.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    return this.listingsService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : 1,
      clampedPageSize,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.listingsService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateListingDto, @Request() req: AuthenticatedRequest) {
    return this.listingsService.create(dto, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.listingsService.update(id, dto, req.user);
  }

  // TRACED: EM-API-010 — Delete listing with tenant/owner validation
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.listingsService.remove(id, req.user);
  }
}
