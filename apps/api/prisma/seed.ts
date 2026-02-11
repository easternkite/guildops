import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const guild = await prisma.guild.upsert({
    where: { id: 'seed-guild-kr' },
    update: { name: 'GuildOps KR', game: 'Lost Ark' },
    create: { id: 'seed-guild-kr', name: 'GuildOps KR', game: 'Lost Ark' },
  });

  const leader = await prisma.member.upsert({
    where: { id: 'seed-member-1' },
    update: { guildId: guild.id, nickname: 'Dongyeon', role: 'LEADER', active: true },
    create: { id: 'seed-member-1', guildId: guild.id, nickname: 'Dongyeon', role: 'LEADER', active: true },
  });

  const raider = await prisma.member.upsert({
    where: { id: 'seed-member-2' },
    update: { guildId: guild.id, nickname: 'Mina', role: 'RAIDER', active: true },
    create: { id: 'seed-member-2', guildId: guild.id, nickname: 'Mina', role: 'RAIDER', active: true },
  });

  const reserve = await prisma.member.upsert({
    where: { id: 'seed-member-3' },
    update: { guildId: guild.id, nickname: 'Joon', role: 'MEMBER', active: false },
    create: { id: 'seed-member-3', guildId: guild.id, nickname: 'Joon', role: 'MEMBER', active: false },
  });

  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 1);
  startsAt.setHours(21, 0, 0, 0);

  const event = await prisma.event.upsert({
    where: { id: 'seed-event-weekly-raid' },
    update: {
      guildId: guild.id,
      title: 'Weekly Legion Raid',
      startsAt,
      status: 'scheduled',
    },
    create: {
      id: 'seed-event-weekly-raid',
      guildId: guild.id,
      title: 'Weekly Legion Raid',
      startsAt,
      status: 'scheduled',
    },
  });

  const attendance = await prisma.attendance.upsert({
    where: { id: 'seed-attendance-weekly-raid' },
    update: {
      guildId: guild.id,
      game: 'Lost Ark',
      title: 'Week 1 Raid Attendance',
      startsAt,
      status: 'open',
    },
    create: {
      id: 'seed-attendance-weekly-raid',
      guildId: guild.id,
      game: 'Lost Ark',
      title: 'Week 1 Raid Attendance',
      startsAt,
      status: 'open',
    },
  });

  await prisma.attendanceCheckIn.upsert({
    where: {
      attendanceId_memberId: {
        attendanceId: attendance.id,
        memberId: leader.id,
      },
    },
    update: { status: 'checked_in', note: 'Ready' },
    create: {
      attendanceId: attendance.id,
      memberId: leader.id,
      status: 'checked_in',
      note: 'Ready',
    },
  });

  await prisma.attendanceCheckIn.upsert({
    where: {
      attendanceId_memberId: {
        attendanceId: attendance.id,
        memberId: raider.id,
      },
    },
    update: { status: 'late', note: 'Traffic' },
    create: {
      attendanceId: attendance.id,
      memberId: raider.id,
      status: 'late',
      note: 'Traffic',
    },
  });

  await prisma.announcement.upsert({
    where: { id: 'seed-announcement-1' },
    update: {
      guildId: guild.id,
      title: 'Tonight raid briefing',
      content: '체크인 페이지에서 상태 갱신 후 20:50까지 디스코드 보이스 입장.',
    },
    create: {
      id: 'seed-announcement-1',
      guildId: guild.id,
      title: 'Tonight raid briefing',
      content: '체크인 페이지에서 상태 갱신 후 20:50까지 디스코드 보이스 입장.',
    },
  });

  await prisma.reward.upsert({
    where: { id: 'seed-reward-1' },
    update: { guildId: guild.id, memberId: leader.id, amount: 150, reason: 'Attendance management' },
    create: {
      id: 'seed-reward-1',
      guildId: guild.id,
      memberId: leader.id,
      amount: 150,
      reason: 'Attendance management',
    },
  });

  await prisma.auditLog.upsert({
    where: { id: 'seed-audit-1' },
    update: {
      actor: 'seed-script',
      action: 'seed-demo-data',
      targetType: 'guild',
      targetId: guild.id,
    },
    create: {
      id: 'seed-audit-1',
      actor: 'seed-script',
      action: 'seed-demo-data',
      targetType: 'guild',
      targetId: guild.id,
    },
  });

  console.log(
    JSON.stringify(
      {
        guildId: guild.id,
        eventId: event.id,
        attendanceId: attendance.id,
        members: [leader.id, raider.id, reserve.id],
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
