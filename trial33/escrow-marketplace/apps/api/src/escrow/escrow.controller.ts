import { Controller, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EscrowService } from './escrow.service';
import { DEFAULT_PAGE_SIZE } from '@escrow-marketplace/shared';
import type { EscrowStatus } from '@escrow-marketplace/shared';

// TRACED: EM-API-ESC-LIST-001 — Escrow endpoints with JWT guard
@Controller('escrow')
@UseGuards(AuthGuard('jwt'))
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Get()
  findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.escrowService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : DEFAULT_PAGE_SIZE,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.escrowService.findOne(id, req.user.tenantId);
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: EscrowStatus },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.escrowService.transition(id, body.status, req.user.tenantId);
  }
}
