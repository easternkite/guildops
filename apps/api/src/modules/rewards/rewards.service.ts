import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

type RewardSummary = {
  guildId: string;
  memberId: string;
  nickname: string;
  attendancePoints: number;
  contributionPoints: number;
  totalPoints: number;
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

  async summarizeByGuild(guildId: string) {
    await this.ensureGuildExists(guildId);

    const [members, checkIns, rewards] = await Promise.all([
      this.prisma.member.findMany({
        where: { guildId },
        select: { id: true, nickname: true },
      }),
      this.prisma.attendanceCheckIn.findMany({
        where: {
          attendance: { guildId },
          status: { in: ['checked_in', 'present'] },
        },
        select: { memberId: true },
      }),
      this.prisma.reward.findMany({
        where: { guildId },
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

    const summary: RewardSummary[] = members
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
      .sort((a: RewardSummary, b: RewardSummary) => b.totalPoints - a.totalPoints);

    return {
      guildId,
      scoringRule: {
        attendanceCheckIn: 10,
        contribution: 'sum(reward.amount)',
      },
      members: summary,
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
