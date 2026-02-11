import { Module } from '@nestjs/common';
import { UauditUlogsController } from './audit-logs.controller';
import { UauditUlogsService } from './audit-logs.service';
@Module({ controllers: [UauditUlogsController], providers: [UauditUlogsService] })
export class UauditUlogsModule {}
