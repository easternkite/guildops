import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlanGateGuard, RequirePlan } from './plans.guard';

@Controller('plans')
export class PlansController {
  constructor(private readonly service: PlansService) {}

  @Get('evaluate')
  evaluate(@Query('guildId') guildId: string) {
    return this.service.evaluateGuildPlan(guildId);
  }

  @Get('pro-only')
  @UseGuards(PlanGateGuard)
  @RequirePlan('pro')
  proOnly(@Query('guildId') guildId: string) {
    return {
      ok: true,
      guildId,
      message: 'pro feature enabled',
    };
  }
}
