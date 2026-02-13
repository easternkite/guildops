import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DEFAULT_FEATURES_BY_TIER, type PlanEvaluation, type PlanTier } from './plans.types';

function parsePlanTier(value: unknown): PlanTier | null {
  if (value === 'free' || value === 'pro' || value === 'enterprise') return value;
  return null;
}

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  private getOverrideTier(guildId: string): PlanTier | null {
    const raw = process.env.GUILDOPS_PLAN_OVERRIDES_JSON;
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const tier = parsePlanTier(parsed[guildId]);
      return tier;
    } catch {
      return null;
    }
  }

  async evaluateGuildPlan(guildId: string): Promise<PlanEvaluation> {
    const guild = await this.prisma.guild.findUnique({ where: { id: guildId }, select: { id: true } });
    if (!guild) throw new BadRequestException(`Guild ${guildId} not found`);

    const overrideTier = this.getOverrideTier(guildId);
    const tier: PlanTier = overrideTier ?? 'free';

    return {
      guildId,
      tier,
      features: DEFAULT_FEATURES_BY_TIER[tier],
      evaluatedAt: new Date().toISOString(),
      source: overrideTier ? 'override' : 'default',
    };
  }
}
