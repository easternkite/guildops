import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordLogin() {
    return { message: 'Redirecting to Discord OAuth...' };
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  discordCallback(@Req() req: any) {
    return {
      message: 'Discord OAuth callback received',
      user: req.user,
      note: 'TODO: persist user/session in DB in next phase',
    };
  }

  @Get('discord/health')
  discordHealth() {
    return {
      provider: 'discord',
      configured: Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
      callbackURL: process.env.DISCORD_CALLBACK_URL ?? 'http://localhost:4000/api/auth/discord/callback',
    };
  }
}
