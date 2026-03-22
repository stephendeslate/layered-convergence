// TRACED:AE-API-02 — Events controller with full CRUD and Cache-Control on list
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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() dto: CreateEventDto): Promise<Record<string, unknown>> {
    return this.eventsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.eventsService.findAll(
      tenantId,
      parseInt(page, 10) || 1,
      parseInt(pageSize, 10) || 20,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Record<string, unknown>> {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ): Promise<Record<string, unknown>> {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.eventsService.remove(id);
  }
}
