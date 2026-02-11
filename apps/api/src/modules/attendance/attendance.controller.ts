import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id/check-ins')
  listCheckIns(@Param('id') id: string) {
    return this.service.listCheckIns(id);
  }

  @Post(':id/check-ins')
  recordCheckIn(@Param('id') id: string, @Body() body: any) {
    return this.service.recordCheckIn(id, body);
  }
}
