// TRACED:EM-ESCROW-02 escrow controller with full CRUD
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Header,
} from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { UpdateEscrowDto } from './dto/update-escrow.dto';

@Controller('escrows')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post()
  create(@Body() dto: CreateEscrowDto) {
    return this.escrowService.create(dto);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.escrowService.findAll(
      tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.escrowService.findOne(id, tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: UpdateEscrowDto,
  ) {
    return this.escrowService.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.escrowService.remove(id, tenantId);
  }
}
