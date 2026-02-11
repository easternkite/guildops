import { Module } from '@nestjs/common';
import { UguildsController } from './guilds.controller';
import { UguildsService } from './guilds.service';
@Module({ controllers: [UguildsController], providers: [UguildsService] })
export class UguildsModule {}
