// TRACED:EM-LISTING-02 listing controller with full CRUD and Cache-Control
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Req, Header,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { Request } from 'express';

@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Post()
  create(@Body() dto: CreateListingDto, @Req() req: Request) {
    const user = req.user as { id: string };
    return this.listingService.create(dto, user.id);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.listingService.findAll(
      tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.listingService.findOne(id, tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingService.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.listingService.remove(id, tenantId);
  }
}
