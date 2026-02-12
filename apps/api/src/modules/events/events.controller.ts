import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UeventsService } from './events.service';

@Controller('events')
export class UeventsController {
  constructor(private readonly service: UeventsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Post('template-apply')
  applyTemplateSchedule(@Body() body: { guildId: string; templateType: string; anchorDate?: string }) {
    return this.service.applyTemplateSchedule(body);
  }

  @Post('template-followup-apply')
  applyTemplateFollowup(
    @Body()
    body: {
      guildId: string;
      templateType: string;
      preset: {
        enableOpsAlert?: boolean;
        enableWeeklyDigest?: boolean;
        createDefaultAnnouncement?: boolean;
      };
    },
  ) {
    return this.service.applyTemplateFollowup(body);
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
