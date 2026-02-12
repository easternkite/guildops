import { RbacRoleManager } from '../../components/rbac-role-manager';
import { getList } from '../../lib/api';

type Member = {
  id: string;
  guildId: string;
  nickname: string;
  role: string;
  active: boolean;
};

export default async function RbacPage() {
  const items = await getList('members').catch(() => [] as Member[]);
  return <RbacRoleManager initialItems={items} />;
}
