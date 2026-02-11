import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

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
