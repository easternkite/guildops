import { AnnouncementsManager } from '../../components/announcements-manager';
import { getList } from '../../lib/api';

export default async function AnnouncementsPage() {
  const items = await getList('announcements').catch(() => []);
  return <AnnouncementsManager initialItems={items} />;
}
