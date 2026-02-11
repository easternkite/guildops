import Link from 'next/link';
import { OpsCommandList } from '../../components/ops-command-list';

export default function ReleaseHubPage() {
  const commands = ['pnpm ops:rehearsal', 'pnpm ops:rehearsal:report', 'pnpm ops:release-check', 'pnpm ops:demo-status:snapshot'];

  return (
    <main>
      <h2>Release Hub</h2>
      <p className="dashboard-subtitle">릴리즈 직전 운영 진입점과 실행 명령을 한 화면에서 관리</p>

      <section className="kpi-grid" style={{ marginTop: 16 }}>
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
