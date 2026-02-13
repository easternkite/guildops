import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UguildsService } from './guilds.service';

@Controller('guilds')
export class UguildsController {
  constructor(private readonly service: UguildsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('templates')
  listTemplates() {
    return this.service.listTemplates();
  }

  @Get('templates/:type')
  getTemplate(@Param('type') type: string) {
    return this.service.getTemplate(type);
  }

  @Get(':id/export-template')
  exportTemplate(@Param('id') id: string) {
    return this.service.exportTemplate(id);
  }

  @Get(':id/reminder-plan')
  getReminderPlan(@Param('id') id: string) {
    return this.service.getReminderAutomationPlan(id);
  }

  @Post(':id/reminder-sync')
  syncReminderPlan(@Param('id') id: string) {
    return this.service.syncReminderSchedules(id);
  }

  @Post(':id/import-template')
  importTemplate(@Param('id') id: string, @Body() template: any) {
    return this.service.importTemplate(id, template);
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
