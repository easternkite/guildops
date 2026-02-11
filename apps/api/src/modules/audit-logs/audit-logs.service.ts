import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UauditUlogsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const found = await this.prisma.auditLog.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`AuditLog ${id} not found`);
    return found;
  }

  create(body: { actor: string; action: string; targetType: string; targetId: string }) {
    return this.prisma.auditLog.create({
      data: {
        actor: body.actor,
        action: body.action,
        targetType: body.targetType,
        targetId: body.targetId,
      },
    });
  }

  async update(
    id: string,
    body: { actor?: string; action?: string; targetType?: string; targetId?: string },
  ) {
    await this.findOne(id);
    return this.prisma.auditLog.update({
      where: { id },
      data: {
        actor: body.actor,
        action: body.action,
        targetType: body.targetType,
        targetId: body.targetId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.auditLog.delete({ where: { id } });
    return { deleted: true };
  }
}
