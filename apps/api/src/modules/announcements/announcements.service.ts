import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UannouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
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
