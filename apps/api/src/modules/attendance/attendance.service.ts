import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAttendanceDto, CreateCheckInDto, UpdateAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.attendance.findMany({
      orderBy: { startsAt: 'asc' },
      include: { _count: { select: { checkIns: true } } },
    });

    return items.map((item: (typeof items)[number]) => ({ ...item, checkInCount: item._count.checkIns }));
  }

  async findOne(id: string) {
    const found = await this.prisma.attendance.findUnique({
      where: { id },
      include: { checkIns: { orderBy: { checkedInAt: 'desc' } } },
    });

    if (!found) throw new NotFoundException(`Attendance ${id} not found`);
    return found;
  }

  async create(body: CreateAttendanceDto, actorRole?: string) {
    this.assertRole(actorRole, ['OWNER', 'ADMIN']);
    await this.ensureGuildExists(body.guildId);

    return this.prisma.attendance.create({
      data: {
        guildId: body.guildId,
        game: body.game,
        title: body.title,
        startsAt: new Date(body.startsAt),
        status: body.status ?? 'open',
      },
    });
  }

  async update(id: string, body: UpdateAttendanceDto, actorRole?: string) {
    this.assertRole(actorRole, ['OWNER', 'ADMIN']);
    await this.ensureAttendanceExists(id);

    return this.prisma.attendance.update({
      where: { id },
      data: {
        game: body.game,
        title: body.title,
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        status: body.status,
      },
    });
  }

  async remove(id: string, actorRole?: string) {
    this.assertRole(actorRole, ['OWNER']);
    await this.ensureAttendanceExists(id);
    await this.prisma.attendanceCheckIn.deleteMany({ where: { attendanceId: id } });
    await this.prisma.attendance.delete({ where: { id } });
    return { deleted: true };
  }

  async listCheckIns(attendanceId: string) {
    await this.ensureAttendanceExists(attendanceId);
    return this.prisma.attendanceCheckIn.findMany({
      where: { attendanceId },
      orderBy: { checkedInAt: 'desc' },
    });
  }

  async recordCheckIn(attendanceId: string, body: CreateCheckInDto, actorRole?: string, actorMemberId?: string) {
    this.assertRole(actorRole, ['OWNER', 'ADMIN', 'MEMBER']);
    if (actorRole === 'MEMBER' && actorMemberId !== body.memberId) {
      throw new ForbiddenException('Members can only check in themselves');
    }

    const attendance = await this.prisma.attendance.findUnique({ where: { id: attendanceId } });
    if (!attendance) throw new NotFoundException(`Attendance ${attendanceId} not found`);

    const member = await this.prisma.member.findUnique({ where: { id: body.memberId } });
    if (!member) throw new BadRequestException(`Member ${body.memberId} does not exist`);
    if (member.guildId !== attendance.guildId) {
      throw new BadRequestException('Member does not belong to this attendance guild');
    }

    return this.prisma.attendanceCheckIn.upsert({
      where: {
        attendanceId_memberId: {
          attendanceId,
          memberId: body.memberId,
        },
      },
      create: {
        attendanceId,
        memberId: body.memberId,
        status: body.status ?? 'checked_in',
        note: body.note,
      },
      update: {
        status: body.status ?? 'checked_in',
        note: body.note,
        checkedInAt: new Date(),
      },
    });
  }

  private async ensureAttendanceExists(id: string) {
    const found = await this.prisma.attendance.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException(`Attendance ${id} not found`);
  }

  private async ensureGuildExists(id: string) {
    const found = await this.prisma.guild.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new BadRequestException(`Guild ${id} does not exist`);
  }

  private assertRole(actorRole: string | undefined, allowedRoles: string[]) {
    if (!actorRole) throw new UnauthorizedException('Missing actor role');
    const normalizedRole = actorRole.toUpperCase();
    if (!allowedRoles.includes(normalizedRole)) {
      throw new ForbiddenException(`Role ${normalizedRole} is not allowed`);
    }
  }
}
