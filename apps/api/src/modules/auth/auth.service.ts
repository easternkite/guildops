import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';

type DiscordUserInput = {
  discordId: string;
  username: string;
  discriminator?: string;
  email?: string;
  avatar?: string;
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

  issueToken(user: { id: string; discordId: string; username: string }) {
    return this.jwtService.sign({ sub: user.id, discordId: user.discordId, username: user.username });
  }

  async getUserFromBearer(authHeader?: string) {
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');
    const token = authHeader.slice('Bearer '.length);

    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
