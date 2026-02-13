import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UannouncementsService } from './announcements.service';
@Controller('announcements')
export class UannouncementsController {
  constructor(private readonly service: UannouncementsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('stats')
  getStats(@Query('guildId') guildId: string) {
    return this.service.getStats(guildId);
  }

  @Post(':id/view')
  incrementView(@Param('id') id: string) {
    return this.service.incrementView(id);
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
