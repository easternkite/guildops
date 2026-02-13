export type PlanTier = 'free' | 'pro' | 'enterprise';

export type FeatureKey =
  | 'reminders'
  | 'multi_guild'
  | 'audit_export'
  | 'ops_reports'
  | 'custom_roles';

export type PlanEvaluation = {
  guildId: string;
  tier: PlanTier;
  features: Record<FeatureKey, boolean>;
  evaluatedAt: string;
  source: 'override' | 'default';
};

export const PLAN_ORDER: PlanTier[] = ['free', 'pro', 'enterprise'];

export const DEFAULT_FEATURES_BY_TIER: Record<PlanTier, Record<FeatureKey, boolean>> = {
  free: {
    reminders: true,
    multi_guild: false,
    audit_export: false,
    ops_reports: false,
    custom_roles: false,
  },
  pro: {
    reminders: true,
    multi_guild: true,
    audit_export: true,
    ops_reports: true,
    custom_roles: true,
  },
  enterprise: {
    reminders: true,
    multi_guild: true,
    audit_export: true,
    ops_reports: true,
    custom_roles: true,
  },
};
