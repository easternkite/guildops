import { getList } from '../../lib/api';

type Attendance = { id: string; checkInCount?: number };
type Member = { id: string; active?: boolean };
type Event = { id: string; title: string; startsAt: string; status?: string };
type Health = { ok?: boolean; status?: string; message?: string };
type DemoChecklist = {
  ok?: boolean;
  checks?: Record<string, boolean>;
  missing?: string[];
};

export default async function DashboardPage() {
  const [attendance, members, events, health, checklist] = await Promise.all([
    getList('attendance').catch(() => [] as Attendance[]),
    getList('members').catch(() => [] as Member[]),
    getList('events').catch(() => [] as Event[]),
    getList('auth/discord/health').catch(() => null as Health | null),
    getList('auth/demo/checklist-health').catch(() => null as DemoChecklist | null),
  ]);

  const attendanceCount = attendance.length;
  const totalCheckIns = attendance.reduce((sum: number, item: Attendance) => sum + (item.checkInCount ?? 0), 0);
  const activeMembers = members.filter((member: Member) => member.active !== false).length;

  const denominator = attendanceCount * Math.max(activeMembers, 1);
  const checkInRate = denominator === 0 ? 0 : Math.round((totalCheckIns / denominator) * 100);

  const recentEvent = [...events]
    .sort((a: Event, b: Event) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .find((event: Event) => event.status !== 'done' && event.status !== 'closed');

  const healthStatus = health?.ok ?? health?.status === 'ok';
  const checklistStatus = checklist?.ok === true;
  const checklistMissing = checklist?.missing ?? [];

  return (
    <main>
      <h2>Dashboard</h2>
      <p className="dashboard-subtitle">실데이터 기반 운영 KPI 요약</p>

      <section className="kpi-grid" aria-label="KPI Widgets">
        <article className="kpi-card">
          <h3>출석 수</h3>
          <p className="kpi-value">{attendanceCount}</p>
          <p className="kpi-note">전체 출석 이벤트</p>
        </article>

        <article className="kpi-card">
          <h3>체크인율</h3>
          <p className="kpi-value">{checkInRate}%</p>
          <p className="kpi-note">총 체크인 {totalCheckIns}건 기준</p>
        </article>

        <article className="kpi-card">
          <h3>활성 멤버</h3>
          <p className="kpi-value">{activeMembers}</p>
          <p className="kpi-note">active=true 멤버 수</p>
        </article>

        <article className="kpi-card">
          <h3>최근 이벤트</h3>
          <p className="kpi-value kpi-value-small">{recentEvent ? recentEvent.title : '예정 이벤트 없음'}</p>
          <p className="kpi-note">
            {recentEvent ? new Date(recentEvent.startsAt).toLocaleString('ko-KR') : '이벤트를 등록해 보세요'}
          </p>
        </article>

        <article className="kpi-card">
          <h3>운영 상태</h3>
          <p className={`kpi-value kpi-value-small ${healthStatus && checklistStatus ? 'status-ok' : 'status-warn'}`}>
            {healthStatus && checklistStatus ? 'API/DEMO 정상' : '점검 필요'}
          </p>
          <p className="kpi-note">
            auth: {healthStatus ? 'ok' : 'fail'} · demo: {checklistStatus ? 'ok' : `missing ${checklistMissing.length}`}
          </p>
          {!checklistStatus && checklistMissing.length > 0 ? (
            <p className="kpi-note">누락: {checklistMissing.join(', ')}</p>
          ) : null}
        </article>
      </section>
    </main>
  );
}
