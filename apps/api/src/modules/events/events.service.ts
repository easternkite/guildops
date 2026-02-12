import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

type TemplateType = 'raid' | 'esports' | 'community';

type TemplateDraft = {
  title: string;
  dayOffset: number;
  hour: number;
};

type FollowupPreset = {
  enableOpsAlert?: boolean;
  enableWeeklyDigest?: boolean;
  createDefaultAnnouncement?: boolean;
};

type FollowupGuard = {
  rollbackOnFailure?: boolean;
  dryRun?: boolean;
};

function buildTemplateDrafts(templateType: TemplateType): TemplateDraft[] {
  switch (templateType) {
    case 'raid':
      return [
        { title: 'Weekly Raid #1', dayOffset: 1, hour: 21 },
        { title: 'Weekly Raid #2', dayOffset: 3, hour: 21 },
        { title: 'Strategy Briefing', dayOffset: 6, hour: 20 },
      ];
    case 'esports':
      return [
        { title: 'Scrim Block A', dayOffset: 1, hour: 20 },
        { title: 'Scrim Block B', dayOffset: 3, hour: 20 },
        { title: 'Replay Review', dayOffset: 5, hour: 21 },
      ];
    default:
      return [
        { title: 'Community Night', dayOffset: 2, hour: 20 },
        { title: 'Monthly Meetup', dayOffset: 9, hour: 19 },
      ];
  }
}

@Injectable()
export class UeventsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.event.findMany({ orderBy: { startsAt: 'asc' } });
  }

  async findOne(id: string) {
    const found = await this.prisma.event.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Event ${id} not found`);
    return found;
  }

  async create(body: any) {
    const guild = await this.prisma.guild.findUnique({ where: { id: body.guildId }, select: { id: true } });
    if (!guild) throw new BadRequestException(`Guild ${body.guildId} does not exist`);

    return this.prisma.event.create({
      data: {
        guildId: body.guildId,
        title: body.title,
        startsAt: new Date(body.startsAt),
        status: body.status ?? 'open',
      },
    });
  }

  async applyTemplateSchedule(body: { guildId: string; templateType: string; anchorDate?: string }) {
    const guild = await this.prisma.guild.findUnique({ where: { id: body.guildId }, select: { id: true } });
    if (!guild) throw new BadRequestException(`Guild ${body.guildId} does not exist`);

    const templateType = body.templateType.toLowerCase() as TemplateType;
    if (!['raid', 'esports', 'community'].includes(templateType)) {
      throw new BadRequestException('templateType must be one of: raid, esports, community');
    }

    const anchor = body.anchorDate ? new Date(body.anchorDate) : new Date();
    if (Number.isNaN(anchor.getTime())) throw new BadRequestException('anchorDate is invalid');

    const drafts = buildTemplateDrafts(templateType);
    const created = await this.prisma.$transaction(
      drafts.map((draft: TemplateDraft) => {
        const startsAt = new Date(anchor);
        startsAt.setDate(startsAt.getDate() + draft.dayOffset);
        startsAt.setHours(draft.hour, 0, 0, 0);

        return this.prisma.event.create({
          data: {
            guildId: body.guildId,
            title: draft.title,
            startsAt,
            status: 'open',
          },
        });
      }),
    );

    return {
      guildId: body.guildId,
      templateType,
      createdCount: created.length,
      created,
    };
  }

  async applyTemplateFollowup(body: {
    guildId: string;
    templateType: string;
    preset: FollowupPreset;
    guard?: FollowupGuard;
  }) {
    const guild = await this.prisma.guild.findUnique({ where: { id: body.guildId }, select: { id: true, name: true } });
    if (!guild) throw new BadRequestException(`Guild ${body.guildId} does not exist`);

    const templateType = body.templateType.toLowerCase() as TemplateType;
    if (!['raid', 'esports', 'community'].includes(templateType)) {
      throw new BadRequestException('templateType must be one of: raid, esports, community');
    }

    const preset = body.preset ?? {};
    const guard: Required<FollowupGuard> = {
      rollbackOnFailure: body.guard?.rollbackOnFailure !== false,
      dryRun: body.guard?.dryRun === true,
    };

    const executionId = `followup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const plan = [
      { key: 'createDefaultAnnouncement', action: 'default-announcement-created', enabled: Boolean(preset.createDefaultAnnouncement) },
      { key: 'enableOpsAlert', action: 'ops-alert-enabled', enabled: Boolean(preset.enableOpsAlert) },
      { key: 'enableWeeklyDigest', action: 'weekly-digest-enabled', enabled: Boolean(preset.enableWeeklyDigest) },
    ];

    if (guard.dryRun) {
      return {
        executionId,
        guildId: body.guildId,
        templateType,
        guard,
        status: 'dry-run',
        steps: plan.map((item) => ({ action: item.action, status: item.enabled ? 'planned' : 'skipped' })),
        retryable: true,
      };
    }

    try {
      const steps = await this.prisma.$transaction(async (tx) => {
        const executed: Array<{ action: string; status: 'applied' | 'skipped' }> = [];

        if (preset.createDefaultAnnouncement) {
          await tx.announcement.create({
            data: {
              guildId: body.guildId,
              title: `[${templateType.toUpperCase()}] 운영 시작 안내`,
              content: `${guild.name} 길드 템플릿 적용이 완료되었습니다. 기본 운영 규칙을 확인해 주세요.`,
            },
          });
          executed.push({ action: 'default-announcement-created', status: 'applied' });
        } else {
          executed.push({ action: 'default-announcement-created', status: 'skipped' });
        }

        if (preset.enableOpsAlert) {
          await tx.auditLog.create({
            data: {
              actor: 'template-followup',
              action: 'enable_ops_alert',
              targetType: 'guild',
              targetId: body.guildId,
            },
          });
          executed.push({ action: 'ops-alert-enabled', status: 'applied' });
        } else {
          executed.push({ action: 'ops-alert-enabled', status: 'skipped' });
        }

        if (preset.enableWeeklyDigest) {
          await tx.auditLog.create({
            data: {
              actor: 'template-followup',
              action: 'enable_weekly_digest',
              targetType: 'guild',
              targetId: body.guildId,
            },
          });
          executed.push({ action: 'weekly-digest-enabled', status: 'applied' });
        } else {
          executed.push({ action: 'weekly-digest-enabled', status: 'skipped' });
        }

        await tx.auditLog.create({
          data: {
            actor: 'template-followup',
            action: 'template_followup_apply_success',
            targetType: 'guild',
            targetId: body.guildId,
          },
        });

        return executed;
      });

      return {
        executionId,
        guildId: body.guildId,
        templateType,
        guard,
        status: 'applied',
        steps,
        retryable: false,
        appliedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (!guard.rollbackOnFailure) {
        // currently transactional apply always rolls back; guard kept for forward compatibility.
      }

      await this.prisma.auditLog.create({
        data: {
          actor: 'template-followup',
          action: 'template_followup_apply_failed',
          targetType: 'guild',
          targetId: body.guildId,
        },
      });

      return {
        executionId,
        guildId: body.guildId,
        templateType,
        guard,
        status: 'failed',
        steps: plan.map((item) => ({ action: item.action, status: item.enabled ? 'rolled-back' : 'skipped' })),
        retryable: true,
        error: (error as Error).message,
      };
    }
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        status: body.status,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { deleted: true };
  }
}
