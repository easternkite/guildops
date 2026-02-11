import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UguildsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.guild.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const found = await this.prisma.guild.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Guild ${id} not found`);
    return found;
  }

  create(body: { name: string; game: string }) {
    return this.prisma.guild.create({
      data: {
        name: body.name,
        game: body.game,
      },
    });
  }

  async update(id: string, body: { name?: string; game?: string }) {
    await this.findOne(id);
    return this.prisma.guild.update({
      where: { id },
      data: {
        name: body.name,
        game: body.game,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.guild.delete({ where: { id } });
    return { deleted: true };
  }
}
