import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-discord';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      clientID: process.env.DISCORD_CLIENT_ID ?? 'placeholder-client-id',
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? 'placeholder-client-secret',
      callbackURL: process.env.DISCORD_CALLBACK_URL ?? 'http://localhost:4000/api/auth/discord/callback',
      scope: ['identify', 'email', 'guilds'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      accessToken,
      refreshToken,
      discordId: profile.id,
      username: profile.username,
      discriminator: profile.discriminator,
      email: profile.email,
      avatar: profile.avatar,
      guilds: profile.guilds,
      provider: 'discord',
    };
  }
}
