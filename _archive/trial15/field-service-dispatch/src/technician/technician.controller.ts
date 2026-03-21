import { Controller, Get, Post, Patch, Body, Param, Req } from '@nestjs/common';
import express from 'express';
import { TechnicianService } from './technician.service.js';
import { CreateTechnicianDto } from './dto/create-technician.dto.js';
import { UpdateTechnicianDto } from './dto/update-technician.dto.js';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(@Req() req: express.Request, @Body() dto: CreateTechnicianDto) {
    return this.technicianService.create(req.companyId!, dto);
  }

  @Get()
  findAll(@Req() req: express.Request) {
    return this.technicianService.findAll(req.companyId!);
  }

  @Get(':id')
  findOne(@Req() req: express.Request, @Param('id') id: string) {
    return this.technicianService.findOne(req.companyId!, id);
  }

  @Patch(':id')
  update(@Req() req: express.Request, @Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.technicianService.update(req.companyId!, id, dto);
  }
}
