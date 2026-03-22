// TRACED: EM-ECTL-001
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
import { EscrowsService } from './escrows.service';
import { CreateEscrowDto, UpdateEscrowDto, EscrowQueryDto } from './escrows.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('escrows')
@UseGuards(JwtAuthGuard)
export class EscrowsController {
  constructor(private readonly escrowsService: EscrowsService) {}

  @Post()
  create(@Body() dto: CreateEscrowDto) {
    return this.escrowsService.create(dto);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  findAll(@Query() query: EscrowQueryDto) {
    return this.escrowsService.findAll(query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.escrowsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEscrowDto) {
    return this.escrowsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.escrowsService.remove(id);
  }
}
