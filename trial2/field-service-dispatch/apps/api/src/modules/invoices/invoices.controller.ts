import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, JwtPayload } from '@field-service/shared';

@UseGuards(RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(user.companyId, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.invoicesService.findAll(user.companyId);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invoicesService.findById(id, user.companyId);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/send')
  send(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invoicesService.send(id, user.companyId);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/mark-paid')
  markAsPaid(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invoicesService.markAsPaid(id, user.companyId);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/void')
  void(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invoicesService.void(id, user.companyId);
  }
}
