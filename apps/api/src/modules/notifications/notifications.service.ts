import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

type DiscordWebhookMessage = {
  content: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private jitter(ms: number) {
    const spread = Math.max(50, Math.floor(ms * 0.2));
    return ms + Math.floor((Math.random() * 2 - 1) * spread);
  }

  async sendDiscordWebhook(input: {
    webhookUrl: string;
    content: string;
    guildId?: string;
    kind?: string;
    maxRetries?: number;
  }) {
    const webhookUrl = input.webhookUrl?.trim();
    if (!webhookUrl) throw new BadRequestException('webhookUrl is required');

    const content = input.content?.trim();
    if (!content) throw new BadRequestException('content is required');

    const maxRetries = input.maxRetries ?? 3;
    const kind = input.kind ?? 'discord-webhook';

    const payload: DiscordWebhookMessage = { content };

    let lastStatus: number | null = null;
    let lastBody: string | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        lastStatus = res.status;
        lastBody = await res.text();

        if (res.ok) {
          await this.prisma.auditLog.create({
            data: {
              actor: 'notifications',
              action: 'notification_sent',
              targetType: kind,
              targetId: input.guildId ?? 'unknown',
            },
          });

          return {
            ok: true,
            attempt,
            status: res.status,
          };
        }
      } catch (err: any) {
        lastStatus = null;
        lastBody = err?.message ?? String(err);
      }

      if (attempt < maxRetries) {
        const backoffMs = 500 * Math.pow(2, attempt - 1);
        await this.sleep(this.jitter(backoffMs));
      }
    }

    await this.prisma.auditLog.create({
      data: {
        actor: 'notifications',
        action: 'notification_failed',
        targetType: kind,
        targetId: input.guildId ?? 'unknown',
      },
    });

    return {
      ok: false,
      status: lastStatus,
      error: lastBody,
    };
  }
}
