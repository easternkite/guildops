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
