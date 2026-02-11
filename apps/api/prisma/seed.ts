import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const guild = await prisma.guild.upsert({
    where: { id: 'seed-guild-kr' },
    update: {},
    create: { id: 'seed-guild-kr', name: 'GuildOps KR', game: 'Lost Ark' },
  });

  await prisma.member.upsert({
    where: { id: 'seed-member-1' },
    update: {},
    create: { id: 'seed-member-1', guildId: guild.id, nickname: 'Dongyeon', role: 'LEADER', active: true },
  });

  await prisma.member.upsert({
    where: { id: 'seed-member-2' },
    update: {},
    create: { id: 'seed-member-2', guildId: guild.id, nickname: 'Mina', role: 'RAIDER', active: true },
  });
}

main().finally(() => prisma.$disconnect());
