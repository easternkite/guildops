import { MembersManager } from '../../components/members-manager';
import { getList } from '../../lib/api';

export default async function MembersPage({ searchParams }: { searchParams?: { guildId?: string } }) {
  const items = await getList('members').catch(() => []);
  const guildId = searchParams?.guildId;
  const filtered = guildId ? items.filter((item: { guildId?: string }) => item.guildId === guildId) : items;
  return <MembersManager initialItems={filtered} />;
}
