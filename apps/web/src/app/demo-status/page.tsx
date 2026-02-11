import { getList } from '../../lib/api';

type DemoChecklist = {
  ok?: boolean;
  checks?: Record<string, boolean>;
  missing?: string[];
};

export default async function DemoStatusPage() {
  const checklist = await getList('auth/demo/checklist-health').catch(() => null as DemoChecklist | null);

  const checks = checklist?.checks ?? {};
  const entries = Object.entries(checks);

  return (
    <section>
      <h2>Demo Status</h2>
      <p className="dashboard-subtitle">demo checklist 상세 상태</p>

      <p>
        overall: <strong className={checklist?.ok ? 'status-ok' : 'status-warn'}>{checklist?.ok ? 'PASS' : 'FAIL'}</strong>
      </p>

      <table>
        <thead>
          <tr>
            <th>Check</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, passed]) => (
            <tr key={name}>
              <td>{name}</td>
              <td className={passed ? 'status-ok' : 'status-warn'}>{passed ? 'ok' : 'missing'}</td>
            </tr>
          ))}
          {entries.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ color: 'var(--muted)' }}>
                checklist 데이터를 불러오지 못했습니다.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {checklist?.missing?.length ? <p className="kpi-note">missing: {checklist.missing.join(', ')}</p> : null}
    </section>
  );
}
