import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto, SubmitEvidenceDto, ResolveDisputeDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @Roles('BUYER')
  async createDispute(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.disputeService.createDispute(
      dto.transactionId,
      user.id,
      dto.reason,
      dto.description,
    );
  }

  @Get()
  async listDisputes(
    @CurrentUser() user: CurrentUserData,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.disputeService.listDisputes(
      user.id,
      user.role,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':id')
  async getDispute(@Param('id') id: string) {
    return this.disputeService.getDisputeDetail(id);
  }

  @Post(':id/evidence')
  async submitEvidence(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: SubmitEvidenceDto,
  ) {
    return this.disputeService.submitEvidence(
      id,
      user.id,
      dto.content,
      dto.fileUrl,
      dto.fileName,
      dto.fileSize,
    );
  }

  @Post(':id/resolve')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async resolveDispute(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputeService.resolveDispute(
      id,
      user.id,
      dto.action,
      dto.note,
    );
  }

  @Post(':id/escalate')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async escalateDispute(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body('note') note: string,
  ) {
    return this.disputeService.escalateDispute(id, user.id, note);
  }
}
