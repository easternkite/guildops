import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

type RewardSummary = {
  rank: number;
  guildId: string;
  memberId: string;
  nickname: string;
  attendancePoints: number;
  contributionPoints: number;
  totalPoints: number;
};

type SeasonWindow = {
  seasonId: string;
  startAt: Date;
  endAt: Date;
};

type SettleRequest = {
  guildId: string;
  seasonId?: string;
  startAt: string;
  endAt: string;
  note?: string;
};

type SettlementResult = {
  settlementId: string;
  guildId: string;
  seasonId: string | null;
  startAt: string;
  endAt: string;
  totalMembers: number;
  totalRewards: number;
  totalPoints: number;
  members: RewardSummary[];
  note: string;
  settledAt: string;
};

@Injectable()
export class UrewardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.reward.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const found = await this.prisma.reward.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Reward ${id} not found`);
    return found;
  }

  async summarizeByGuild(guildId: string, seasonWindow?: SeasonWindow) {
    await this.ensureGuildExists(guildId);

    const attendanceWhere = seasonWindow
      ? {
          attendance: {
            guildId,
            startsAt: {
              gte: seasonWindow.startAt,
              lt: seasonWindow.endAt,
            },
          },
          status: { in: ['checked_in', 'present'] },
        }
      : {
          attendance: { guildId },
          status: { in: ['checked_in', 'present'] },
        };

    const rewardsWhere = seasonWindow
      ? {
          guildId,
          createdAt: {
            gte: seasonWindow.startAt,
            lt: seasonWindow.endAt,
          },
        }
      : { guildId };

    const [members, checkIns, rewards] = await Promise.all([
      this.prisma.member.findMany({
        where: { guildId },
        select: { id: true, nickname: true },
      }),
      this.prisma.attendanceCheckIn.findMany({
        where: attendanceWhere,
        select: { memberId: true },
      }),
      this.prisma.reward.findMany({
        where: rewardsWhere,
        select: { memberId: true, amount: true },
      }),
    ]);

    const attendancePointsByMember = new Map<string, number>();
    for (const checkIn of checkIns) {
      const current = attendancePointsByMember.get(checkIn.memberId) ?? 0;
      attendancePointsByMember.set(checkIn.memberId, current + 10);
    }

    const contributionPointsByMember = new Map<string, number>();
    for (const reward of rewards) {
      const current = contributionPointsByMember.get(reward.memberId) ?? 0;
      contributionPointsByMember.set(reward.memberId, current + reward.amount);
    }

    const summary = members
      .map((member: { id: string; nickname: string }) => {
        const attendancePoints = attendancePointsByMember.get(member.id) ?? 0;
        const contributionPoints = contributionPointsByMember.get(member.id) ?? 0;
        return {
          guildId,
          memberId: member.id,
          nickname: member.nickname,
          attendancePoints,
          contributionPoints,
          totalPoints: attendancePoints + contributionPoints,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      })) as RewardSummary[];

    return {
      guildId,
      season: seasonWindow
        ? {
            seasonId: seasonWindow.seasonId,
            startAt: seasonWindow.startAt.toISOString(),
            endAt: seasonWindow.endAt.toISOString(),
          }
        : null,
      scoringRule: {
        attendanceCheckIn: 10,
        contribution: 'sum(reward.amount)',
      },
      members: summary,
    };
  }

  async settle(request: SettleRequest): Promise<SettlementResult> {
    await this.ensureGuildExists(request.guildId);

    const startAt = new Date(request.startAt);
    const endAt = new Date(request.endAt);

    if (Number.isNaN(startAt.getTime())) {
      throw new BadRequestException('startAt is invalid');
    }

    if (Number.isNaN(endAt.getTime())) {
      throw new BadRequestException('endAt is invalid');
    }

    if (startAt >= endAt) {
      throw new BadRequestException('startAt must be before endAt');
    }

    const seasonWindow: SeasonWindow = {
      seasonId: request.seasonId || `manual-${Date.now()}`,
      startAt,
      endAt,
    };

    const summary = await this.summarizeByGuild(request.guildId, seasonWindow);

    const result = await this.prisma.$transaction(async (tx) => {
      // Create settlement record
      const settlement = await tx.rewardSettlement.create({
        data: {
          guildId: request.guildId,
          seasonId: request.seasonId,
          startAt,
          endAt,
          totalMembers: summary.members.length,
          totalRewards: summary.members.filter((m) => m.totalPoints > 0).length,
          totalPoints: summary.members.reduce((sum, m) => sum + m.totalPoints, 0),
        },
      });

      // Create reward records for members with points
      const rewardCreations = summary.members
        .filter((member) => member.totalPoints > 0)
        .map((member) =>
          tx.reward.create({
            data: {
              guildId: request.guildId,
              memberId: member.memberId,
              amount: member.totalPoints,
              reason: request.note || `Settlement for ${seasonWindow.seasonId}`,
              settlementId: settlement.id,
            },
          })
        );

      await Promise.all(rewardCreations);

      return {
        settlementId: settlement.id,
        guildId: request.guildId,
        seasonId: request.seasonId || null,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        totalMembers: settlement.totalMembers,
        totalRewards: settlement.totalRewards,
        totalPoints: settlement.totalPoints,
        members: summary.members,
        note: request.note || '',
        settledAt: settlement.settledAt.toISOString(),
      };
    });

    return result;
  }

  async getSettlements(query: { guildId?: string; seasonId?: string; limit?: number } = {}) {
    const limit = Math.max(1, Math.min(query.limit ?? 20, 100));

    const where: { guildId?: string; seasonId?: string } = {};
    if (query.guildId) {
      where.guildId = query.guildId;
    }
    if (query.seasonId) {
      where.seasonId = query.seasonId;
    }

    const settlements = await this.prisma.rewardSettlement.findMany({
      where,
      orderBy: { settledAt: 'desc' },
      take: limit,
    });

    return {
      count: settlements.length,
      items: settlements,
    };
  }

  async getSettlement(id: string) {
    const settlement = await this.prisma.rewardSettlement.findUnique({
      where: { id },
    });

    if (!settlement) {
      throw new NotFoundException(`Settlement ${id} not found`);
    }

    // Get rewards for this settlement
    const rewards = await this.prisma.reward.findMany({
      where: { settlementId: id },
      orderBy: { amount: 'desc' },
    });

    // Get member nicknames
    const memberIds = Array.from(new Set(rewards.map((r) => r.memberId)));
    const members = await this.prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, nickname: true },
    });

    const memberNicknameMap = new Map(members.map((m) => [m.id, m.nickname]));

    const memberRewards = rewards.map((reward) => ({
      memberId: reward.memberId,
      nickname: memberNicknameMap.get(reward.memberId) || 'Unknown',
      amount: reward.amount,
      reason: reward.reason,
    }));

    return {
      ...settlement,
      rewards: memberRewards,
    };
  }

  async create(body: { guildId: string; memberId: string; amount: number; reason: string }) {
    await this.ensureGuildExists(body.guildId);
    await this.ensureMemberInGuild(body.memberId, body.guildId);

    return this.prisma.reward.create({
      data: {
        guildId: body.guildId,
        memberId: body.memberId,
        amount: body.amount,
        reason: body.reason,
      },
    });
  }

  async update(
    id: string,
    body: { guildId?: string; memberId?: string; amount?: number; reason?: string },
  ) {
    const current = await this.findOne(id);
    const nextGuildId = body.guildId ?? current.guildId;
    const nextMemberId = body.memberId ?? current.memberId;

    await this.ensureGuildExists(nextGuildId);
    await this.ensureMemberInGuild(nextMemberId, nextGuildId);

    return this.prisma.reward.update({
      where: { id },
      data: {
        guildId: body.guildId,
        memberId: body.memberId,
        amount: body.amount,
        reason: body.reason,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.reward.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureGuildExists(guildId: string) {
    const guild = await this.prisma.guild.findUnique({ where: { id: guildId }, select: { id: true } });
    if (!guild) throw new BadRequestException(`Guild ${guildId} does not exist`);
  }

  private async ensureMemberInGuild(memberId: string, guildId: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId }, select: { guildId: true } });
    if (!member) throw new BadRequestException(`Member ${memberId} does not exist`);
    if (member.guildId !== guildId) throw new BadRequestException('Member does not belong to this guild');
  }
}
