import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { ConnectorConfigDto } from './dto/connector-config.dto';

@Controller('connectors')
export class ConnectorController {
  constructor(private readonly connectorService: ConnectorService) {}

  @Post('config')
  upsertConfig(@Body() dto: ConnectorConfigDto) {
    return this.connectorService.upsertConfig(dto);
  }

  @Get(':dataSourceId/config')
  getConfig(@Param('dataSourceId') dataSourceId: string) {
    return this.connectorService.getConfig(dataSourceId);
  }

  @Delete(':dataSourceId/config')
  removeConfig(@Param('dataSourceId') dataSourceId: string) {
    return this.connectorService.removeConfig(dataSourceId);
  }
}
