import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserRole } from '@repo/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PayoutsService } from './payouts.service';

interface RequestWithUser {
  user: { sub: string; email: string; role: string };
}

@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Get()
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  findAll(
    @Request() req: RequestWithUser,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.payoutsService.findAll(req.user.sub, req.user.role, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  findOne(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payoutsService.findOne(id, req.user.sub, req.user.role);
  }
}
