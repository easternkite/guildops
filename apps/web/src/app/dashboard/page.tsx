import { DashboardCustomizer } from '../../components/dashboard-customizer';
import { DashboardRefreshButton } from '../../components/dashboard-refresh-button';
import { getList } from '../../lib/api';

type Attendance = { id: string; checkInCount?: number };
type Member = { id: string; guildId?: string; active?: boolean };
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
  const guildOptions: string[] = Array.from(
    new Set<string>(
      members
        .map((member: Member) => member.guildId)
        .filter((guildId: string | undefined): guildId is string => Boolean(guildId)),
    ),
  );

  return (
    <main>
      <h2>Dashboard</h2>
      <p className="dashboard-subtitle">실데이터 기반 운영 KPI 요약</p>
      <div style={{ marginTop: 8 }}>
        <DashboardRefreshButton />
      </div>

      <DashboardCustomizer
        guildOptions={guildOptions.length ? guildOptions : ['guild-default']}
        attendanceCount={attendanceCount}
        checkInRate={checkInRate}
        totalCheckIns={totalCheckIns}
        activeMembers={activeMembers}
        recentEventTitle={recentEvent ? recentEvent.title : '예정 이벤트 없음'}
        recentEventAt={recentEvent ? new Date(recentEvent.startsAt).toLocaleString('ko-KR') : '이벤트를 등록해 보세요'}
        healthStatus={healthStatus}
        checklistStatus={checklistStatus}
        checklistMissing={checklistMissing}
      />
    </main>
  );
}
