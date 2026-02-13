import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';

type DiscordUserInput = {
  discordId: string;
  username: string;
  discriminator?: string;
  email?: string;
  avatar?: string;
};

type GuildMembership = {
  guildId: string;
  guildName: string;
  role: string;
  active: boolean;
};

type JwtPayload = {
  sub: string;
  discordId: string;
  username: string;
  guilds?: GuildMembership[];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async upsertFromDiscord(user: DiscordUserInput) {
    return this.prisma.user.upsert({
      where: { discordId: user.discordId },
      create: {
        discordId: user.discordId,
        username: user.username,
        discriminator: user.discriminator,
        email: user.email,
        avatar: user.avatar,
      },
      update: {
        username: user.username,
        discriminator: user.discriminator,
        email: user.email,
        avatar: user.avatar,
      },
    });
  }

  async getUserGuildMemberships(userId: string): Promise<GuildMembership[]> {
    const members = await this.prisma.member.findMany({
      where: { userId, active: true },
      include: {
        guild: {
          select: { id: true, name: true },
        },
      },
      orderBy: { guild: { name: 'asc' } },
    });

    return members.map((member) => ({
      guildId: member.guild.id,
      guildName: member.guild.name,
      role: member.role,
      active: member.active,
    }));
  }

  async linkUserToMember(userId: string, guildId: string, role?: string) {
    // Find the user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(`User ${userId} does not exist`);
    }

    // Find an existing member in this guild without a userId (created before OAuth link)
    const existingMember = await this.prisma.member.findFirst({
      where: {
        guildId,
        userId: null,
        OR: role
          ? [
              { nickname: { contains: user.username } },
              { nickname: { contains: user.discriminator || '' } },
            ]
          : [],
      },
    });

    if (existingMember) {
      // Link the user to the existing member
      return this.prisma.member.update({
        where: { id: existingMember.id },
        data: {
          userId,
          ...(role && { role }),
        },
      });
    }

    // No existing member, this is expected for users not yet added to a guild
    return null;
  }

  async issueToken(user: { id: string; discordId: string; username: string }, includeGuilds: boolean = false) {
    const payload: JwtPayload = {
      sub: user.id,
      discordId: user.discordId,
      username: user.username,
    };

    if (includeGuilds) {
      payload.guilds = await this.getUserGuildMemberships(user.id);
    }

    return this.jwtService.sign(payload);
  }

  async getUserFromBearer(authHeader?: string, includeGuilds: boolean = false) {
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');
    const token = authHeader.slice('Bearer '.length);

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(token) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');

    return user;
  }

  async getUserContext(authHeader?: string) {
    const user = await this.getUserFromBearer(authHeader);
    const guilds = await this.getUserGuildMemberships(user.id);

    return {
      user: {
        id: user.id,
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
      },
      guilds,
    };
  }

  async getDiscordRoleSyncPreview(guildId: string) {
    const guild = await this.prisma.guild.findUnique({ where: { id: guildId }, select: { id: true, name: true } });
    if (!guild) throw new BadRequestException(`Guild ${guildId} does not exist`);

    const members = await this.prisma.member.findMany({
      where: { guildId },
      select: { id: true, nickname: true, role: true, active: true },
      orderBy: { nickname: 'asc' },
    });

    const roleMap: Record<string, string> = {
      OWNER: 'Guild Owner',
      ADMIN: 'Guild Admin',
      MEMBER: 'Guild Member',
    };

    return {
      guild: { id: guild.id, name: guild.name },
      dryRun: true,
      target: 'discord-role-sync',
      syncedAt: new Date().toISOString(),
      actions: members.map((member: { id: string; nickname: string; role: string; active: boolean }) => ({
        memberId: member.id,
        nickname: member.nickname,
        active: member.active,
        appRole: member.role,
        expectedDiscordRole: roleMap[member.role] ?? `Guild ${member.role}`,
      })),
    };
  }

  async getDemoChecklistHealth() {
    const [guild, members, event, attendance, announcement, reward, auditLog] = await Promise.all([
      this.prisma.guild.findUnique({ where: { id: 'seed-guild-kr' }, select: { id: true } }),
      this.prisma.member.count({ where: { id: { in: ['seed-member-1', 'seed-member-2', 'seed-member-3'] } } }),
      this.prisma.event.findUnique({ where: { id: 'seed-event-weekly-raid' }, select: { id: true } }),
      this.prisma.attendance.findUnique({ where: { id: 'seed-attendance-weekly-raid' }, select: { id: true } }),
      this.prisma.announcement.findUnique({ where: { id: 'seed-announcement-1' }, select: { id: true } }),
      this.prisma.reward.findUnique({ where: { id: 'seed-reward-1' }, select: { id: true } }),
      this.prisma.auditLog.findUnique({ where: { id: 'seed-audit-1' }, select: { id: true } }),
    ]);

    const checks = {
      guild: Boolean(guild),
      members: members >= 3,
      event: Boolean(event),
      attendance: Boolean(attendance),
      announcement: Boolean(announcement),
      reward: Boolean(reward),
      auditLog: Boolean(auditLog),
    };

    const ok = Object.values(checks).every(Boolean);
    return {
      ok,
      checks,
      missing: Object.entries(checks)
        .filter(([, passed]) => !passed)
        .map(([name]) => name),
    };
  }
}
