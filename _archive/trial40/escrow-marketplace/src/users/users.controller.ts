import {
  Controller,
  Get,
  Param,
  UseFilters,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseFilters(PrismaExceptionFilter)
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
