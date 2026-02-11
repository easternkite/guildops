import { Module } from '@nestjs/common';
import { UmembersController } from './members.controller';
import { UmembersService } from './members.service';
@Module({ controllers: [UmembersController], providers: [UmembersService] })
export class UmembersModule {}
