import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, JwtPayload } from '@field-service/shared';

@UseGuards(RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(user.companyId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.customersService.findAll(user.companyId);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.customersService.findById(id, user.companyId);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, user.companyId, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.customersService.delete(id, user.companyId);
  }
}
