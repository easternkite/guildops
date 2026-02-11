import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const guild = await prisma.guild.create({ data: { name: 'GuildOps KR', game: 'Lost Ark' } });
  await prisma.member.create({ data: { guildId: guild.id, nickname: 'Dongyeon', role: 'LEADER', active: true } });
}
main().finally(() => prisma.$disconnect());
