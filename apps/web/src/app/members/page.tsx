import { MembersManager } from '../../components/members-manager';
import { getList } from '../../lib/api';

export default async function MembersPage() {
  const items = await getList('members').catch(() => []);
  return <MembersManager initialItems={items} />;
}
