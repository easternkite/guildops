import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto, CreateCheckInDto, UpdateAttendanceDto } from './dto/attendance.dto';

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
  create(@Body() body: CreateAttendanceDto, @Headers('x-guild-role') actorRole?: string) {
    return this.service.create(body, actorRole);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAttendanceDto, @Headers('x-guild-role') actorRole?: string) {
    return this.service.update(id, body, actorRole);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-guild-role') actorRole?: string) {
    return this.service.remove(id, actorRole);
  }

  @Get(':id/check-ins')
  listCheckIns(@Param('id') id: string) {
    return this.service.listCheckIns(id);
  }

  @Post(':id/check-ins')
  recordCheckIn(
    @Param('id') id: string,
    @Body() body: CreateCheckInDto,
    @Headers('x-guild-role') actorRole?: string,
    @Headers('x-member-id') actorMemberId?: string,
  ) {
    return this.service.recordCheckIn(id, body, actorRole, actorMemberId);
  }
}
