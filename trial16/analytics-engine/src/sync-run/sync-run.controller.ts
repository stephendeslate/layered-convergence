import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { CreateSyncRunDto, UpdateSyncRunDto } from './sync-run.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.dto';

@Controller('sync-runs')
@UseGuards(AuthGuard)
export class SyncRunController {
  constructor(private readonly syncRunService: SyncRunService) {}

  @Post()
  create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateSyncRunDto,
  ) {
    return this.syncRunService.create(req.user.tenantId, dto);
  }

  @Get()
  findAll(
    @Req() req: Request & { user: JwtPayload },
    @Query('dataSourceId') dataSourceId?: string,
  ) {
    return this.syncRunService.findAll(req.user.tenantId, dataSourceId);
  }

  @Get(':id')
  findOne(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.syncRunService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateSyncRunDto,
  ) {
    return this.syncRunService.update(req.user.tenantId, id, dto);
  }
}
