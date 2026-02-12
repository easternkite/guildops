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

  async applyTemplateFollowup(body: { guildId: string; templateType: string; preset: FollowupPreset }) {
    const guild = await this.prisma.guild.findUnique({ where: { id: body.guildId }, select: { id: true, name: true } });
    if (!guild) throw new BadRequestException(`Guild ${body.guildId} does not exist`);

    const templateType = body.templateType.toLowerCase() as TemplateType;
    if (!['raid', 'esports', 'community'].includes(templateType)) {
      throw new BadRequestException('templateType must be one of: raid, esports, community');
    }

    const preset = body.preset ?? {};
    const actions: string[] = [];

    if (preset.createDefaultAnnouncement) {
      await this.prisma.announcement.create({
        data: {
          guildId: body.guildId,
          title: `[${templateType.toUpperCase()}] 운영 시작 안내`,
          content: `${guild.name} 길드 템플릿 적용이 완료되었습니다. 기본 운영 규칙을 확인해 주세요.`,
        },
      });
      actions.push('default-announcement-created');
    }

    if (preset.enableOpsAlert) {
      await this.prisma.auditLog.create({
        data: {
          actor: 'template-followup',
          action: 'enable_ops_alert',
          targetType: 'guild',
          targetId: body.guildId,
        },
      });
      actions.push('ops-alert-enabled');
    }

    if (preset.enableWeeklyDigest) {
      await this.prisma.auditLog.create({
        data: {
          actor: 'template-followup',
          action: 'enable_weekly_digest',
          targetType: 'guild',
          targetId: body.guildId,
        },
      });
      actions.push('weekly-digest-enabled');
    }

    return {
      guildId: body.guildId,
      templateType,
      appliedPreset: {
        enableOpsAlert: Boolean(preset.enableOpsAlert),
        enableWeeklyDigest: Boolean(preset.enableWeeklyDigest),
        createDefaultAnnouncement: Boolean(preset.createDefaultAnnouncement),
      },
      actions,
      appliedAt: new Date().toISOString(),
    };
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
