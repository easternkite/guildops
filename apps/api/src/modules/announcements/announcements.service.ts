import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

type AnnouncementStats = {
  total: number;
  totalViews: number;
  recent: Array<{
    id: string;
    title: string;
    createdAt: Date;
    viewCount: number;
  }>;
  mostViewed: Array<{
    id: string;
    title: string;
    viewCount: number;
  }>;
};

@Injectable()
export class UannouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getStats(guildId: string): Promise<AnnouncementStats> {
    const [total, recent, mostViewed] = await Promise.all([
      this.prisma.announcement.count({ where: { guildId } }),
      this.prisma.announcement.findMany({
        where: { guildId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, createdAt: true, viewCount: true },
      }),
      this.prisma.announcement.findMany({
        where: { guildId },
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: { id: true, title: true, viewCount: true },
      }),
    ]);

    const totalViews = await this.prisma.announcement.aggregate({
      where: { guildId },
      _sum: { viewCount: true },
    });

    return {
      total,
      totalViews: (totalViews._sum?.viewCount ?? 0),
      recent,
      mostViewed,
    };
  }

  async incrementView(id: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new NotFoundException(`Announcement ${id} not found`);

    await this.prisma.announcement.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return { success: true, newCount: (announcement.viewCount ?? 0) + 1 };
  }

  async findOne(id: string) {
    const found = await this.prisma.announcement.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Announcement ${id} not found`);
    return found;
  }

  async create(body: any) {
    const guild = await this.prisma.guild.findUnique({ where: { id: body.guildId }, select: { id: true } });
    if (!guild) throw new BadRequestException(`Guild ${body.guildId} does not exist`);

    return this.prisma.announcement.create({
      data: {
        guildId: body.guildId,
        title: body.title,
        content: body.content,
      },
    });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.announcement.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.announcement.delete({ where: { id } });
    return { deleted: true };
  }
}
