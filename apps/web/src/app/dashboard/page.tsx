import { getList } from '../../lib/api';

type Attendance = { id: string; checkInCount?: number };
type Member = { id: string; active?: boolean };
type Event = { id: string; title: string; startsAt: string; status?: string };

export default async function DashboardPage() {
  const [attendance, members, events] = await Promise.all([
    getList('attendance').catch(() => [] as Attendance[]),
    getList('members').catch(() => [] as Member[]),
    getList('events').catch(() => [] as Event[]),
  ]);

  const attendanceCount = attendance.length;
  const totalCheckIns = attendance.reduce((sum: number, item: Attendance) => sum + (item.checkInCount ?? 0), 0);
  const activeMembers = members.filter((member: Member) => member.active !== false).length;

  const denominator = attendanceCount * Math.max(activeMembers, 1);
  const checkInRate = denominator === 0 ? 0 : Math.round((totalCheckIns / denominator) * 100);

  const recentEvent = [...events]
    .sort((a: Event, b: Event) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .find((event: Event) => event.status !== 'done' && event.status !== 'closed');

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
      </section>
    </main>
  );
}
