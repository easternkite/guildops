import { EventsManager } from '../../components/events-manager';
import { getList } from '../../lib/api';

export default async function EventsPage() {
  const items = await getList('events').catch(() => []);
  return <EventsManager initialItems={items} />;
}
