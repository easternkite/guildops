import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UmembersService } from './members.service';
@Controller('members')
export class UmembersController {
  constructor(private readonly service: UmembersService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
