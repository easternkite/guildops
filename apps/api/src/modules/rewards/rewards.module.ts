import { Module } from '@nestjs/common';
import { UrewardsController } from './rewards.controller';
import { UrewardsService } from './rewards.service';
@Module({ controllers: [UrewardsController], providers: [UrewardsService] })
export class UrewardsModule {}
