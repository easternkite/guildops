import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function assertSafeReset() {
  const allowFlag = process.env.ALLOW_DEMO_RESET === 'true';
  const env = process.env.NODE_ENV ?? 'development';

  if (!allowFlag) {
    throw new Error('Refusing reset: set ALLOW_DEMO_RESET=true to run demo reset.');
  }

  if (env === 'production') {
    throw new Error('Refusing reset in production environment.');
  }
}

async function main() {
  assertSafeReset();

  const guildId = 'seed-guild-kr';

  await prisma.attendanceCheckIn.deleteMany({ where: { attendanceId: { startsWith: 'seed-attendance-' } } });
  await prisma.attendance.deleteMany({ where: { id: { startsWith: 'seed-attendance-' } } });
  await prisma.event.deleteMany({ where: { id: { startsWith: 'seed-event-' } } });
  await prisma.announcement.deleteMany({ where: { id: { startsWith: 'seed-announcement-' } } });
  await prisma.reward.deleteMany({ where: { id: { startsWith: 'seed-reward-' } } });
  await prisma.auditLog.deleteMany({ where: { id: { startsWith: 'seed-audit-' } } });
  await prisma.member.deleteMany({ where: { id: { startsWith: 'seed-member-' } } });
  await prisma.guild.deleteMany({ where: { id: guildId } });

  console.log('Demo seed entities reset complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
