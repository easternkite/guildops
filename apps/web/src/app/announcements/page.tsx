import { AnnouncementsManager } from '../../components/announcements-manager';
import { getList } from '../../lib/api';

export default async function AnnouncementsPage({ searchParams }: { searchParams?: { guildId?: string } }) {
  const items = await getList('announcements').catch(() => []);
  const guildId = searchParams?.guildId;
  const filtered = guildId ? items.filter((item: { guildId?: string }) => item.guildId === guildId) : items;
  return <AnnouncementsManager initialItems={filtered} />;
}
