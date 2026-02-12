import { DashboardCustomizer } from '../../components/dashboard-customizer';
import { DashboardRefreshButton } from '../../components/dashboard-refresh-button';
import { getList } from '../../lib/api';

type Attendance = { id: string; checkInCount?: number };
type Member = { id: string; guildId?: string; active?: boolean };
type Event = { id: string; guildId?: string; title: string; startsAt: string; status?: string };
type Health = { ok?: boolean; status?: string; message?: string };
type DemoChecklist = {
  ok?: boolean;
  checks?: Record<string, boolean>;
  missing?: string[];
};

type ProbeResult<T> = {
  data: T;
  ok: boolean;
  latencyMs: number;
};

async function probe<T>(runner: () => Promise<T>, fallback: T): Promise<ProbeResult<T>> {
  const startedAt = Date.now();
  try {
    const data = await runner();
    return {
      data,
      ok: true,
      latencyMs: Date.now() - startedAt,
    };
  } catch {
    return {
      data: fallback,
      ok: false,
      latencyMs: Date.now() - startedAt,
    };
  }
}

export default async function DashboardPage({ searchParams }: { searchParams?: { guildId?: string } }) {
  const [attendanceProbe, membersProbe, eventsProbe, healthProbe, checklistProbe] = await Promise.all([
    probe(() => getList('attendance'), [] as Attendance[]),
    probe(() => getList('members'), [] as Member[]),
    probe(() => getList('events'), [] as Event[]),
    probe(() => getList('auth/discord/health'), null as Health | null),
    probe(() => getList('auth/demo/checklist-health'), null as DemoChecklist | null),
  ]);

  const attendance = attendanceProbe.data;
  const members = membersProbe.data;
  const events = eventsProbe.data;
  const health = healthProbe.data;
  const checklist = checklistProbe.data;

  const guildId = searchParams?.guildId;
  const scopedMembers = guildId ? members.filter((member: Member) => member.guildId === guildId) : members;
  const scopedEvents = guildId ? events.filter((event: Event & { guildId?: string }) => event.guildId === guildId) : events;

  const attendanceCount = attendance.length;
  const totalCheckIns = attendance.reduce((sum: number, item: Attendance) => sum + (item.checkInCount ?? 0), 0);
  const activeMembers = scopedMembers.filter((member: Member) => member.active !== false).length;

  const denominator = attendanceCount * Math.max(activeMembers, 1);
  const checkInRate = denominator === 0 ? 0 : Math.round((totalCheckIns / denominator) * 100);

  const recentEvent = [...scopedEvents]
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

  const probes = [attendanceProbe, membersProbe, eventsProbe, healthProbe, checklistProbe];
  const avgLatency = Math.round(probes.reduce((sum: number, probeResult: ProbeResult<unknown>) => sum + probeResult.latencyMs, 0) / probes.length);
  const errorCount = probes.filter((probeResult: ProbeResult<unknown>) => !probeResult.ok).length;

  return (
    <main>
      <h2>Dashboard</h2>
      <p className="dashboard-subtitle">실데이터 기반 운영 KPI 요약</p>
      <div style={{ marginTop: 8 }}>
        <DashboardRefreshButton />
      </div>

      <section style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Observability</h3>
        <p className="kpi-note">핵심 API probe 기반 latency/error 지표</p>
        <div className="hub-action-links" style={{ marginTop: 8 }}>
          <span className="status-pill status-pill-ok">avg latency {avgLatency}ms</span>
          <span className={errorCount === 0 ? 'status-pill status-pill-ok' : 'status-pill status-pill-warn'}>
            probe errors {errorCount}/{probes.length}
          </span>
        </div>
      </section>

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
