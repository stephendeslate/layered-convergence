import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('disputes')
@UseFilters(PrismaExceptionFilter)
@UseGuards(RolesGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateDisputeDto) {
    return this.disputesService.create(req.user.id, dto);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.disputesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.disputesService.findById(id);
  }

  @Patch(':id/resolve')
  @Roles('ADMIN')
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @Request() req: any,
  ) {
    return this.disputesService.resolve(id, dto, req.user.id);
  }
}
