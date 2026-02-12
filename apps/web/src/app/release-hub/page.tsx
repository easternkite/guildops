import Link from 'next/link';
import { OpsCommandList } from '../../components/ops-command-list';
import { ReleaseHubRefresh } from '../../components/release-hub-refresh';
import { getList } from '../../lib/api';

type Health = { ok?: boolean; status?: string };
type DemoChecklist = { ok?: boolean; missing?: string[] };

export default async function ReleaseHubPage() {
  const commands = ['pnpm ops:rehearsal', 'pnpm ops:rehearsal:report', 'pnpm ops:release-check', 'pnpm ops:demo-status:snapshot'];

  const [health, checklist] = await Promise.all([
    getList('auth/discord/health').catch(() => null as Health | null),
    getList('auth/demo/checklist-health').catch(() => null as DemoChecklist | null),
  ]);

  const authOk = health?.ok ?? health?.status === 'ok';
  const demoOk = checklist?.ok === true;
  const missing = checklist?.missing ?? [];

  return (
    <main>
      <h2>Release Hub</h2>
      <p className="dashboard-subtitle">릴리즈 직전 운영 진입점과 실행 명령을 한 화면에서 관리</p>
      <ReleaseHubRefresh />

      <section className="kpi-grid" style={{ marginTop: 16 }}>
        <article className="kpi-card">
          <h3>Hub 운영 상태</h3>
          <p className={`kpi-value kpi-value-small ${authOk && demoOk ? 'status-ok' : 'status-warn'}`}>
            {authOk && demoOk ? '정상' : '점검 필요'}
          </p>
          <p className="kpi-note">auth: {authOk ? 'ok' : 'fail'} · demo: {demoOk ? 'ok' : `missing ${missing.length}`}</p>
          {!demoOk && missing.length > 0 ? <p className="kpi-note">누락: {missing.join(', ')}</p> : null}
          <p className="kpi-note"><Link href="/demo-status">Demo Status 이동</Link></p>
        </article>

        <article className="kpi-card">
          <h3>핵심 화면</h3>
          <p className="kpi-note"><Link href="/release-signoff">Release Signoff</Link></p>
          <p className="kpi-note"><Link href="/demo-status">Demo Status</Link></p>
          <p className="kpi-note"><Link href="/dashboard">Dashboard</Link></p>
          <p className="kpi-note"><Link href="/feedback">Feedback Inbox</Link></p>
        </article>

        <article className="kpi-card">
          <h3>운영 명령</h3>
          <OpsCommandList commands={commands} />
          <p className="kpi-note" style={{ marginTop: 8 }}>
            <a href="https://github.com/easternkite/guildops/blob/main/RUNBOOK.md" target="_blank" rel="noreferrer">RUNBOOK 열기</a>
          </p>
        </article>
      </section>
    </main>
  );
}
