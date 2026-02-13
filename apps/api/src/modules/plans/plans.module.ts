import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PlansController } from './plans.controller';
import { PlanGateGuard } from './plans.guard';
import { PlansService } from './plans.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlansController],
  providers: [PlansService, PlanGateGuard],
  exports: [PlansService, PlanGateGuard],
})
export class PlansModule {}
