import { Module } from '@nestjs/common';
import { RoleHeadersGuard } from '../../common/authz/role-headers.guard';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, RoleHeadersGuard],
})
export class AttendanceModule {}
