import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';

@Injectable()
export class UmembersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(guildId?: string) {
    return this.prisma.member.findMany({
      where: guildId ? { guildId } : undefined,
      orderBy: { nickname: 'asc' },
    });
  }

  async findOne(id: string) {
    const found = await this.prisma.member.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Member ${id} not found`);
    return found;
  }

  async create(body: CreateMemberDto) {
    const guild = await this.prisma.guild.findUnique({ where: { id: body.guildId }, select: { id: true } });
    if (!guild) throw new BadRequestException(`Guild ${body.guildId} does not exist`);

    return this.prisma.member.create({
      data: {
        guildId: body.guildId,
        nickname: body.nickname,
        role: body.role,
        active: body.active ?? true,
      },
    });
  }

  async update(id: string, body: UpdateMemberDto) {
    await this.findOne(id);
    return this.prisma.member.update({ where: { id }, data: body });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.member.delete({ where: { id } });
    return { deleted: true };
  }
}
