import { Module } from '@nestjs/common';
import { GuildsModule } from './modules/guilds/guilds.module';
import { MembersModule } from './modules/members/members.module';
import { EventsModule } from './modules/events/events.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
@Module({ imports: [GuildsModule, MembersModule, EventsModule, AnnouncementsModule, RewardsModule, AuditLogsModule] })
export class AppModule {}
