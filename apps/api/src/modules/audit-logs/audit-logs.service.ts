import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  actor?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  fromDate?: string;
  toDate?: string;
}

interface PaginatedAuditLogs {
  items: Array<{
    id: string;
    actor: string;
    action: string;
    targetType: string;
    targetId: string;
    createdAt: Date;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class UauditUlogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AuditLogQueryParams = {}): Promise<PaginatedAuditLogs> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    // Build where clause with filters
    const where: {
      actor?: string;
      action?: string;
      targetType?: string;
      targetId?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (query.actor) {
      where.actor = query.actor;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.targetType) {
      where.targetType = query.targetType;
    }

    if (query.targetId) {
      where.targetId = query.targetId;
    }

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) {
        where.createdAt.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.createdAt.lte = new Date(query.toDate);
      }
    }

    // Execute count and findMany in parallel for better performance
    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
