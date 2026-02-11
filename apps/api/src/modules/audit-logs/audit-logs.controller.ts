import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UauditUlogsService } from './audit-logs.service';
@Controller('audit-logs')
export class UauditUlogsController {
  constructor(private readonly service: UauditUlogsService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
