import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlansService } from './plans.service';
import { PLAN_ORDER, type PlanTier } from './plans.types';

export const REQUIRED_PLAN_KEY = 'requiredPlanTier';

export const RequirePlan = (tier: PlanTier) => SetMetadata(REQUIRED_PLAN_KEY, tier);

@Injectable()
export class PlanGateGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly plans: PlansService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PlanTier | undefined>(REQUIRED_PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) return true;

    const req = context.switchToHttp().getRequest();
    const guildId = req.query?.guildId ?? req.body?.guildId;

    if (!guildId || typeof guildId !== 'string') {
      throw new ForbiddenException('Plan-gated endpoint requires guildId');
    }

    const evaluation = await this.plans.evaluateGuildPlan(guildId);

    const requiredRank = PLAN_ORDER.indexOf(required);
    const actualRank = PLAN_ORDER.indexOf(evaluation.tier);

    if (actualRank < requiredRank) {
      throw new ForbiddenException(`Plan ${evaluation.tier} is not allowed (requires ${required})`);
    }

    req.plan = evaluation;
    return true;
  }
}
