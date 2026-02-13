import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UguildsController } from './guilds.controller';
import { UguildsService } from './guilds.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [UguildsController],
  providers: [UguildsService],
})
export class UguildsModule {}
