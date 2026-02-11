import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UeventsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.event.findMany({ orderBy: { startsAt: 'asc' } });
  }

  async findOne(id: string) {
    const found = await this.prisma.event.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Event ${id} not found`);
    return found;
  }

  async create(body: any) {
    const guild = await this.prisma.guild.findUnique({ where: { id: body.guildId }, select: { id: true } });
    if (!guild) throw new BadRequestException(`Guild ${body.guildId} does not exist`);

    return this.prisma.event.create({
      data: {
        guildId: body.guildId,
        title: body.title,
        startsAt: new Date(body.startsAt),
        status: body.status ?? 'open',
      },
    });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        status: body.status,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { deleted: true };
  }
}
