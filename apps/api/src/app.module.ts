import { Module } from '@nestjs/common';
import { UguildsModule } from './modules/guilds/guilds.module';
import { UmembersModule } from './modules/members/members.module';
import { UeventsModule } from './modules/events/events.module';
import { UannouncementsModule } from './modules/announcements/announcements.module';
import { UrewardsModule } from './modules/rewards/rewards.module';
import { UauditUlogsModule } from './modules/audit-logs/audit-logs.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    UguildsModule,
    UmembersModule,
    UeventsModule,
    UannouncementsModule,
    UrewardsModule,
    UauditUlogsModule,
    AttendanceModule,
    AuthModule,
  ],
})
export class AppModule {}
