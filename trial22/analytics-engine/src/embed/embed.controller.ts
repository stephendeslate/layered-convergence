// [TRACED:AC-016] Embed controller with public token lookup

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EmbedService } from './embed.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthRequest {
  user: { sub: string; tenantId: string; role: string };
}

@Controller('embeds')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Get('token/:token')
  findByToken(@Param('token') token: string) {
    return this.embedService.findByToken(token);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: AuthRequest) {
    return this.embedService.findAll(req.user.tenantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() body: { config?: object; expiresAt: string },
    @Request() req: AuthRequest,
  ) {
    return this.embedService.create({
      config: body.config,
      tenantId: req.user.tenantId,
      expiresAt: new Date(body.expiresAt),
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.embedService.remove(id, req.user.tenantId);
  }
}
