import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

type GuildTemplateType = 'raid' | 'esports' | 'community';

type GuildTemplate = {
  type: GuildTemplateType;
  name: string;
  description: string;
  defaults: {
    roles: string[];
    eventCadence: string;
    attendancePolicy: string;
    announcementStyle: string;
  };
};

type ExportedTemplate = {
  id: string;
  name: string;
  type: 'custom';
  roles: string[];
  eventCadence: string;
  attendancePolicy: string;
  announcementStyle: string;
  metadata: {
    exportedAt: string;
    guildId: string;
    guildName: string;
    memberCount: number;
    eventCount: number;
  };
};

const GUILD_TEMPLATES: GuildTemplate[] = [
  {
    type: 'raid',
    name: '레이드 길드 템플릿',
    description: '주간 레이드 중심 운영을 위한 기본 템플릿',
    defaults: {
      roles: ['OWNER', 'ADMIN', 'RAID_LEADER', 'MEMBER'],
      eventCadence: '주 2회 레이드 + 주 1회 전략 브리핑',
      attendancePolicy: '레이드 시작 30분 전 출석 체크, 불참 사유 기록',
      announcementStyle: '레이드 일정/공략/준비물 중심 공지',
    },
  },
  {
    type: 'esports',
    name: '이스포츠 팀 템플릿',
    description: '스크림/대회 운영 중심 템플릿',
    defaults: {
      roles: ['OWNER', 'COACH', 'ANALYST', 'PLAYER'],
      eventCadence: '주 3회 스크림 + 주 1회 리뷰 세션',
      attendancePolicy: '스크림 15분 전 체크인, 지각/결장 자동 태깅',
      announcementStyle: '대진표/스크림 스케줄/전술 리뷰 공지',
    },
  },
  {
    type: 'community',
    name: '커뮤니티 길드 템플릿',
    description: '친목/이벤트 운영 중심 템플릿',
    defaults: {
      roles: ['OWNER', 'MODERATOR', 'MEMBER'],
      eventCadence: '주 1회 커뮤니티 이벤트 + 월간 정기 모임',
      attendancePolicy: '이벤트 참여 체크 + 신규 멤버 온보딩 추적',
      announcementStyle: '공지 + 이벤트 하이라이트 + 참여 독려',
    },
  },
];

@Injectable()
export class UguildsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.guild.findMany({ orderBy: { name: 'asc' } });
  }

  listTemplates() {
    return GUILD_TEMPLATES;
  }

  getTemplate(type: string) {
    const normalized = type.toLowerCase() as GuildTemplateType;
    const template = GUILD_TEMPLATES.find((item: GuildTemplate) => item.type === normalized);
    if (!template) {
      throw new BadRequestException(`Unknown guild template type: ${type}`);
    }
    return template;
  }

  async exportTemplate(guildId: string): Promise<ExportedTemplate> {
    // 길드 조회
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      include: {
        members: {
          where: { active: true },
          select: { role: true },
        },
        events: {
          orderBy: { startsAt: 'desc' },
          take: 20,
          select: { title: true, startsAt: true, status: true },
        },
      },
    });

    if (!guild) {
      throw new NotFoundException(`Guild ${guildId} not found`);
    }

    // 역할 집계 (중복 제거)
    const uniqueRoles = Array.from(
      new Set(guild.members.map((member) => member.role))
    ).sort();

    // 이벤트 패턴 분석
    const eventPattern = this.analyzeEventPattern(guild.events);

    // 내보낼 템플릿 생성
    const exported: ExportedTemplate = {
      id: `exported-${guildId}-${Date.now()}`,
      name: `${guild.name} 템플릿`,
      type: 'custom',
      roles: uniqueRoles,
      eventCadence: eventPattern.cadence,
      attendancePolicy: '기본 출석 정책',
      announcementStyle: '기본 공지 스타일',
      metadata: {
        exportedAt: new Date().toISOString(),
        guildId: guild.id,
        guildName: guild.name,
        memberCount: guild.members.length,
        eventCount: guild.events.length,
      },
    };

    return exported;
  }

  private analyzeEventPattern(events: { title: string; startsAt: Date; status: string }[]) {
    if (events.length === 0) {
      return { cadence: '이벤트 없음' };
    }

    // 간단한 패턴 분석: 이벤트 제목에서 키워드 추출
    const titles = events.map((e) => e.title.toLowerCase());

    const hasRaid = titles.some((t) => t.includes('raid') || t.includes('레이드'));
    const hasScrim = titles.some((t) => t.includes('scrim') || t.includes('스크림'));
    const hasMeeting = titles.some((t) => t.includes('meeting') || t.includes('회의'));
    const hasEvent = titles.some((t) => t.includes('event') || t.includes('이벤트'));

    let cadence = '정기 이벤트';

    if (hasRaid && !hasScrim && !hasMeeting) {
      cadence = '주간 레이드 중심';
    } else if (!hasRaid && hasScrim && !hasMeeting) {
      cadence = '주간 스크림 중심';
    } else if (hasEvent) {
      cadence = '주간 커뮤니티 이벤트';
    } else if (hasMeeting) {
      cadence = '정기 회의 포함';
    }

    // 이벤트 빈도 추정
    const recentWeekEvents = events.filter(
      (e) => e.startsAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    if (recentWeekEvents >= 3) {
      cadence += ' (주 3회 이상)';
    } else if (recentWeekEvents >= 2) {
      cadence += ' (주 2회)';
    } else if (recentWeekEvents >= 1) {
      cadence += ' (주 1회)';
    }

    return { cadence };
  }

  async getReminderAutomationPlan(guildId: string) {
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      include: {
        events: {
          orderBy: { startsAt: 'asc' },
          take: 10,
          select: { id: true, title: true, startsAt: true, status: true },
        },
      },
    });

    if (!guild) {
      throw new NotFoundException(`Guild ${guildId} not found`);
    }

    const activeEvents = guild.events.filter((event) => event.status !== 'cancelled');

    return {
      guild: { id: guild.id, name: guild.name },
      generatedAt: new Date().toISOString(),
      rules: [
        {
          key: 'event_t_minus_24h',
          enabled: true,
          description: '이벤트 24시간 전 리마인더',
          when: '-24h',
          channel: 'discord#announcements',
        },
        {
          key: 'event_t_minus_1h',
          enabled: true,
          description: '이벤트 1시간 전 출석 체크 리마인더',
          when: '-1h',
          channel: 'discord#attendance',
        },
        {
          key: 'event_t_plus_2h_no_checkin',
          enabled: true,
          description: '이벤트 시작 후 2시간 내 미체크인 멤버 리마인더',
          when: '+2h',
          channel: 'dm',
        },
      ],
      upcoming: activeEvents.slice(0, 3).map((event) => ({
        eventId: event.id,
        title: event.title,
        startsAt: event.startsAt,
        reminders: [
          { key: 'event_t_minus_24h', scheduledAt: new Date(event.startsAt.getTime() - 24 * 60 * 60 * 1000) },
          { key: 'event_t_minus_1h', scheduledAt: new Date(event.startsAt.getTime() - 60 * 60 * 1000) },
          { key: 'event_t_plus_2h_no_checkin', scheduledAt: new Date(event.startsAt.getTime() + 2 * 60 * 60 * 1000) },
        ],
      })),
    };
  }

  async importTemplate(guildId: string, template: ExportedTemplate) {
    // 길드 조회
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (!guild) {
      throw new NotFoundException(`Guild ${guildId} not found`);
    }

    // 템플릿 검증
    if (!template.roles || !Array.isArray(template.roles)) {
      throw new BadRequestException('Template must have a roles array');
    }

    if (!template.name || template.name.trim() === '') {
      throw new BadRequestException('Template must have a name');
    }

    // 템플릿 적용 (트랜잭션)
    const appliedResult = await this.prisma.$transaction(async (tx) => {
      const applied: {
        rolesCreated: number;
        announcementsCreated: number;
        auditLogsCreated: number;
      } = {
        rolesCreated: 0,
        announcementsCreated: 0,
        auditLogsCreated: 0,
      };

      // 템플릿의 역할을 멤버 예시로 생성 (필요한 경우)
      // Note: 실제 멤버 생성은 Discord OAuth 연동 시 수행
      // 여기서는 템플릿 역할을 저장하기 위한 placeholder 멤버 생성
      for (const role of template.roles) {
        if (role && role.trim() !== '') {
          // 이미 존재하는 역할 확인
          const existingMember = await tx.member.findFirst({
            where: { guildId, role },
          });

          if (!existingMember) {
            await tx.member.create({
              data: {
                guildId,
                nickname: `[TEMPLATE] ${role}`,
                role,
                active: false, // 템플릿 역할은 비활성으로 표시
              },
            });
            applied.rolesCreated++;
          }
        }
      }

      // 출석 정책 공지 생성
      if (template.attendancePolicy && template.attendancePolicy.trim() !== '') {
        await tx.announcement.create({
          data: {
            guildId,
            title: `[${template.name}] 출석 정책`,
            content: template.attendancePolicy,
          },
        });
        applied.announcementsCreated++;
      }

      // 공지 스타일 공지 생성
      if (template.announcementStyle && template.announcementStyle.trim() !== '') {
        await tx.announcement.create({
          data: {
            guildId,
            title: `[${template.name}] 공지 스타일 가이드`,
            content: template.announcementStyle,
          },
        });
        applied.announcementsCreated++;
      }

      // 감사 로그 생성
      await tx.auditLog.create({
        data: {
          actor: 'template-import',
          action: 'template_imported',
          targetType: 'guild',
          targetId: guildId,
        },
      });
      applied.auditLogsCreated++;

      return applied;
    });

    return {
      guildId,
      templateName: template.name,
      importedAt: new Date().toISOString(),
      ...appliedResult,
    };
  }

  async findOne(id: string) {
    const found = await this.prisma.guild.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Guild ${id} not found`);
    return found;
  }

  create(body: { name: string; game: string }) {
    return this.prisma.guild.create({
      data: {
        name: body.name,
        game: body.game,
      },
    });
  }

  async update(id: string, body: { name?: string; game?: string }) {
    await this.findOne(id);
    return this.prisma.guild.update({
      where: { id },
      data: {
        name: body.name,
        game: body.game,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.guild.delete({ where: { id } });
    return { deleted: true };
  }
}
