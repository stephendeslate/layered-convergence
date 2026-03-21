import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';
import { Request } from 'express';

/**
 * Authenticated endpoints for managing embed configurations.
 */
@Controller('api/embeds')
@UseGuards(JwtAuthGuard)
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateEmbedConfigDto,
  ) {
    const data = await this.embedService.createEmbedConfig(tenantId, dto);
    return { data };
  }

  @Get()
  async list(
    @CurrentTenant() tenantId: string,
    @Query('dashboardId') dashboardId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.embedService.listEmbedConfigs(tenantId, {
      dashboardId,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  async get(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.embedService.getEmbedConfig(id, tenantId);
    return { data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateEmbedConfigDto,
  ) {
    const data = await this.embedService.updateEmbedConfig(id, tenantId, dto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.embedService.deleteEmbedConfig(id, tenantId);
  }

  @Get(':id/code')
  async getCode(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.embedService.generateEmbedCode(id, tenantId);
    return { data };
  }
}

/**
 * Public endpoint for embed data (API key authentication).
 * This is what the iframe renderer calls to load dashboard content.
 */
@Controller('api/embed-data')
@UseGuards(ApiKeyAuthGuard)
export class EmbedDataController {
  constructor(private readonly embedService: EmbedService) {}

  @Get(':embedId')
  async getEmbedData(
    @Param('embedId') embedId: string,
    @Req() req: Request,
    @CurrentTenant() tenantId: string,
  ) {
    // First get embed config to check origin
    const config = await this.embedService.getEmbedConfig(embedId, tenantId);

    // Validate origin (SRS-4 section 2.1)
    const origin = req.headers.origin as string | undefined;
    const isValidOrigin = this.embedService.validateOrigin(
      embedId,
      origin,
      config.allowedOrigins,
    );

    if (!isValidOrigin) {
      throw new ForbiddenException('Origin not allowed');
    }

    const data = await this.embedService.getEmbedData(embedId, tenantId);
    return { data };
  }
}
