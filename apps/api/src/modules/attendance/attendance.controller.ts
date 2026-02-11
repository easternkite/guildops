import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Actor, ActorContext } from '../../common/authz/actor-context.decorator';
import { AllowedRoles } from '../../common/authz/allowed-roles.decorator';
import { RoleHeadersGuard } from '../../common/authz/role-headers.guard';
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
  @UseGuards(RoleHeadersGuard)
  @AllowedRoles('OWNER', 'ADMIN')
  create(@Body() body: CreateAttendanceDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UseGuards(RoleHeadersGuard)
  @AllowedRoles('OWNER', 'ADMIN')
  update(@Param('id') id: string, @Body() body: UpdateAttendanceDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RoleHeadersGuard)
  @AllowedRoles('OWNER')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id/check-ins')
  listCheckIns(@Param('id') id: string) {
    return this.service.listCheckIns(id);
  }

  @Post(':id/check-ins')
  @UseGuards(RoleHeadersGuard)
  @AllowedRoles('OWNER', 'ADMIN', 'MEMBER')
  recordCheckIn(@Param('id') id: string, @Body() body: CreateCheckInDto, @Actor() actor: ActorContext) {
    return this.service.recordCheckIn(id, body, actor.role, actor.memberId);
  }
}
