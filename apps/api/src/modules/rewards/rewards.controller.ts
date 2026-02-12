import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UrewardsService } from './rewards.service';

@Controller('rewards')
export class UrewardsController {
  constructor(private readonly service: UrewardsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('summary')
  summary(@Query('guildId') guildId?: string) {
    if (!guildId) {
      throw new BadRequestException('guildId query is required');
    }
    return this.service.summarizeByGuild(guildId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
