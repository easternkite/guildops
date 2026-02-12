import { EventsManager } from '../../components/events-manager';
import { getList } from '../../lib/api';

export default async function EventsPage({ searchParams }: { searchParams?: { guildId?: string } }) {
  const items = await getList('events').catch(() => []);
  const guildId = searchParams?.guildId;
  const filtered = guildId ? items.filter((item: { guildId?: string }) => item.guildId === guildId) : items;
  return <EventsManager initialItems={filtered} />;
}
