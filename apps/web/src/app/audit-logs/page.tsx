import { AuditLogViewer } from '../../components/audit-log-viewer';
import { getList } from '../../lib/api';

type AuditLog = {
  id: string;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
};

export default async function AuditLogsPage() {
  const items = await getList('audit-logs').catch(() => [] as AuditLog[]);
  return <AuditLogViewer initialItems={items} />;
}
