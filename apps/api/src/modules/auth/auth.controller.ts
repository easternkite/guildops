import { BadRequestException, Body, Controller, Get, Headers, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
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
    // Include guild context in token
    const token = await this.authService.issueToken(user, true);
    const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

    return res.redirect(`${webOrigin}/?token=${encodeURIComponent(token)}`);
  }

  // Useful for smoke tests/local dev without live OAuth callback.
  @Post('token')
  async tokenForDev(@Body() body: TokenLoginDto) {
    const user = await this.authService.upsertFromDiscord(body);
    return { token: await this.authService.issueToken(user, true), user };
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    return this.authService.getUserContext(authorization);
  }

  @Get('me/guilds')
  async meGuilds(@Headers('authorization') authorization?: string) {
    const user = await this.authService.getUserFromBearer(authorization);
    const guilds = await this.authService.getUserGuildMemberships(user.id);
    return {
      userId: user.id,
      username: user.username,
      guilds,
    };
  }

  @Post('link-member')
  async linkMember(@Body() body: { guildId: string; role?: string }, @Headers('authorization') authorization: string) {
    const user = await this.authService.getUserFromBearer(authorization);
    const result = await this.authService.linkUserToMember(user.id, body.guildId, body.role);

    if (result) {
      // Reload guilds after linking
      const guilds = await this.authService.getUserGuildMemberships(user.id);
      return { success: true, member: result, guilds };
    }

    return {
      success: false,
      message: 'No unlinked member found in guild. Create member first.',
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

  @Get('demo/checklist-health')
  demoChecklistHealth() {
    return this.authService.getDemoChecklistHealth();
  }

  @Get('discord/role-sync-preview')
  discordRoleSyncPreview(@Query('guildId') guildId?: string) {
    if (!guildId) throw new BadRequestException('guildId query is required');
    return this.authService.getDiscordRoleSyncPreview(guildId);
  }
}
