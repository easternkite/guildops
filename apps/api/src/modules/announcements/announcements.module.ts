import { Module } from '@nestjs/common';
import { UannouncementsController } from './announcements.controller';
import { UannouncementsService } from './announcements.service';
@Module({ controllers: [UannouncementsController], providers: [UannouncementsService] })
export class UannouncementsModule {}
