// TRACED: EM-DCTL-001
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Header,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto, UpdateDisputeDto, DisputeQueryDto } from './disputes.dto';

@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  create(
    @Body() dto: CreateDisputeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.disputesService.create(dto, req.user.id);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  findAll(@Query() query: DisputeQueryDto) {
    return this.disputesService.findAll(query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDisputeDto) {
    return this.disputesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disputesService.remove(id);
  }
}
