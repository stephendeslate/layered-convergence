// TRACED:EM-DISPUTE-02 dispute controller with full CRUD
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Req, Header,
} from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { Request } from 'express';

@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(@Body() dto: CreateDisputeDto, @Req() req: Request) {
    const user = req.user as { id: string };
    return this.disputeService.create(dto, user.id);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.disputeService.findAll(
      tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.disputeService.findOne(id, tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: UpdateDisputeDto,
  ) {
    return this.disputeService.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.disputeService.remove(id, tenantId);
  }
}
