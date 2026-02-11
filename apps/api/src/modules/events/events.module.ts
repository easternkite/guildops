import { Module } from '@nestjs/common';
import { UeventsController } from './events.controller';
import { UeventsService } from './events.service';
@Module({ controllers: [UeventsController], providers: [UeventsService] })
export class UeventsModule {}
