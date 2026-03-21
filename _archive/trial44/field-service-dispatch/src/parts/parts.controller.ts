import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';

@Controller('parts')
@UseGuards(JwtAuthGuard)
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() dto: CreatePartDto) {
    return this.partsService.create(companyId, dto);
  }

  @Get('work-order/:workOrderId')
  findByWorkOrder(
    @CompanyId() companyId: string,
    @Param('workOrderId') workOrderId: string,
  ) {
    return this.partsService.findByWorkOrder(companyId, workOrderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partsService.findOne(id);
  }

  @Patch(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePartDto,
  ) {
    return this.partsService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.partsService.remove(companyId, id);
  }
}
