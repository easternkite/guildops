import { Body, Controller, Get, Headers, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { TokenLoginDto } from './dto/auth-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordLogin() {
    return { message: 'Redirecting to Discord OAuth...' };
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Req() req: any, @Res() res: any) {
    const profile = req.user;
    if (!profile?.discordId) throw new UnauthorizedException('OAuth profile missing');

    const user = await this.authService.upsertFromDiscord(profile);
    const token = this.authService.issueToken(user);
    const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

    return res.redirect(`${webOrigin}/?token=${encodeURIComponent(token)}`);
  }

  // Useful for smoke tests/local dev without live OAuth callback.
  @Post('token')
  async tokenForDev(@Body() body: TokenLoginDto) {
    const user = await this.authService.upsertFromDiscord(body);
    return { token: this.authService.issueToken(user), user };
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    const user = await this.authService.getUserFromBearer(authorization);
    return { user };
  }

  @Get('discord/health')
  discordHealth() {
    return {
      provider: 'discord',
      configured: Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
      callbackURL: process.env.DISCORD_CALLBACK_URL ?? 'http://localhost:4000/api/auth/discord/callback',
    };
  }

  @Get('demo/checklist-health')
  demoChecklistHealth() {
    return this.authService.getDemoChecklistHealth();
  }
}
