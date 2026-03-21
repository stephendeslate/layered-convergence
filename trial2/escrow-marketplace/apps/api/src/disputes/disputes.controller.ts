import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserRole } from '@repo/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { SubmitEvidenceDto } from './dto/submit-evidence.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

interface RequestWithUser {
  user: { sub: string; email: string; role: string };
}

@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputesController {
  constructor(private disputesService: DisputesService) {}

  @Post()
  @Roles(UserRole.BUYER)
  create(@Request() req: RequestWithUser, @Body() dto: CreateDisputeDto) {
    return this.disputesService.create(req.user.sub, dto);
  }

  @Get()
  findAll(
    @Request() req: RequestWithUser,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.disputesService.findAll(req.user.sub, req.user.role, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disputesService.findOne(id, req.user.sub, req.user.role);
  }

  @Post(':id/evidence')
  @Roles(UserRole.BUYER, UserRole.PROVIDER)
  submitEvidence(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitEvidenceDto,
  ) {
    return this.disputesService.submitEvidence(id, req.user.sub, req.user.role, dto.evidence);
  }

  @Post(':id/resolve')
  @Roles(UserRole.ADMIN)
  resolve(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolve(id, req.user.sub, dto);
  }
}
