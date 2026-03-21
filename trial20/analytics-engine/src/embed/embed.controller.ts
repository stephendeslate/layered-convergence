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
import { CreateEmbedDto } from './dto/create-embed.dto';

@Controller('embeds')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.embedService.findAll(req.user.tenantId);
  }

  @Get('token/:token')
  findByToken(@Param('token') token: string) {
    return this.embedService.findByToken(token);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateEmbedDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.embedService.create(dto, req.user.tenantId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.embedService.delete(id, req.user.tenantId);
  }
}
