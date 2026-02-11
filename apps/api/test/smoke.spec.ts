import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

function createPrismaMock() {
  const guilds = [{ id: 'g1', name: 'GuildOps', game: 'Lost Ark' }];
  const members: any[] = [{ id: 'm1', guildId: 'g1', nickname: 'Leader', role: 'LEADER', active: true }];
  const attendances: any[] = [];
  const checkIns: any[] = [];
  const users: any[] = [];

  return {
    guild: {
      findUnique: jest.fn(async ({ where }: any) => guilds.find((g) => g.id === where.id) ?? null),
    },
    member: {
      findUnique: jest.fn(async ({ where }: any) => members.find((m) => m.id === where.id) ?? null),
      findMany: jest.fn(async ({ where }: any) =>
        where?.guildId ? members.filter((m) => m.guildId === where.guildId) : [...members],
      ),
      create: jest.fn(async ({ data }: any) => {
        const row = { id: `m${members.length + 1}`, ...data };
        members.push(row);
        return row;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const i = members.findIndex((m) => m.id === where.id);
        members[i] = { ...members[i], ...data };
        return members[i];
      }),
      delete: jest.fn(async ({ where }: any) => {
        const i = members.findIndex((m) => m.id === where.id);
        return members.splice(i, 1)[0];
      }),
    },
    attendance: {
      findMany: jest.fn(async () =>
        attendances.map((a) => ({ ...a, _count: { checkIns: checkIns.filter((c) => c.attendanceId === a.id).length } })),
      ),
      findUnique: jest.fn(async ({ where, include }: any) => {
        const found = attendances.find((a) => a.id === where.id) ?? null;
        if (!found) return null;
        if (include?.checkIns) return { ...found, checkIns: checkIns.filter((c) => c.attendanceId === found.id) };
        return found;
      }),
      create: jest.fn(async ({ data }: any) => {
        const row = { id: `a${attendances.length + 1}`, createdAt: new Date(), ...data };
        attendances.push(row);
        return row;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const i = attendances.findIndex((a) => a.id === where.id);
        attendances[i] = { ...attendances[i], ...data };
        return attendances[i];
      }),
      delete: jest.fn(async ({ where }: any) => {
        const i = attendances.findIndex((a) => a.id === where.id);
        return attendances.splice(i, 1)[0];
      }),
    },
    attendanceCheckIn: {
      findMany: jest.fn(async ({ where }: any) => checkIns.filter((c) => c.attendanceId === where.attendanceId)),
      deleteMany: jest.fn(async ({ where }: any) => {
        for (let i = checkIns.length - 1; i >= 0; i -= 1) {
          if (checkIns[i].attendanceId === where.attendanceId) checkIns.splice(i, 1);
        }
        return { count: 0 };
      }),
      upsert: jest.fn(async ({ where, create, update }: any) => {
        const idx = checkIns.findIndex(
          (c) =>
            c.attendanceId === where.attendanceId_memberId.attendanceId &&
            c.memberId === where.attendanceId_memberId.memberId,
        );
        if (idx >= 0) {
          checkIns[idx] = { ...checkIns[idx], ...update };
          return checkIns[idx];
        }
        const row = { id: `c${checkIns.length + 1}`, checkedInAt: new Date(), ...create };
        checkIns.push(row);
        return row;
      }),
    },
    user: {
      upsert: jest.fn(async ({ where, create, update }: any) => {
        const i = users.findIndex((u) => u.discordId === where.discordId);
        if (i >= 0) {
          users[i] = { ...users[i], ...update };
          return users[i];
        }
        const row = { id: `u${users.length + 1}`, ...create };
        users.push(row);
        return row;
      }),
      findUnique: jest.fn(async ({ where }: any) => users.find((u) => u.id === where.id) ?? null),
    },
  };
}

describe('GuildOps API smoke', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const prismaMock = createPrismaMock();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('auth health/token/me flow works', async () => {
    await request(app.getHttpServer()).get('/api/auth/discord/health').expect(200);

    const tokenRes = await request(app.getHttpServer())
      .post('/api/auth/token')
      .send({ discordId: 'd1', username: 'tester' })
      .expect(201);

    expect(tokenRes.body.token).toBeDefined();

    const me = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenRes.body.token}`)
      .expect(200);

    expect(me.body.user.discordId).toBe('d1');
  });

  it('attendance CRUD/check-in flow works', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/attendance')
      .set('x-guild-role', 'OWNER')
      .send({ guildId: 'g1', game: 'Lost Ark', title: 'Week 1 raid', startsAt: new Date().toISOString() })
      .expect(201);

    const attendanceId = create.body.id;

    await request(app.getHttpServer())
      .post(`/api/attendance/${attendanceId}/check-ins`)
      .set('x-guild-role', 'MEMBER')
      .set('x-member-id', 'm1')
      .send({ memberId: 'm1', status: 'checked_in', note: 'On time' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/attendance/${attendanceId}/check-ins`)
      .set('x-guild-role', 'MEMBER')
      .set('x-member-id', 'm1')
      .send({ memberId: 'm999', status: 'checked_in' })
      .expect(403);

    const detail = await request(app.getHttpServer()).get(`/api/attendance/${attendanceId}`).expect(200);
    expect(detail.body.checkIns).toHaveLength(1);

    await request(app.getHttpServer())
      .patch(`/api/attendance/${attendanceId}`)
      .set('x-guild-role', 'ADMIN')
      .send({ status: 'closed' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/attendance/${attendanceId}`)
      .set('x-guild-role', 'OWNER')
      .expect(200);
  });
});
