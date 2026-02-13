import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post('discord-webhook')
  sendDiscordWebhook(
    @Body()
    body: {
      webhookUrl: string;
      content: string;
      guildId?: string;
      kind?: string;
      maxRetries?: number;
    },
  ) {
    return this.service.sendDiscordWebhook(body);
  }
}
