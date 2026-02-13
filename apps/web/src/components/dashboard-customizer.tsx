'use client';

import { useMemo, useState } from 'react';
import { ReleaseReadinessCard } from './release-readiness-card';

type WidgetKey = 'attendance' | 'checkin' | 'members' | 'event' | 'announcements' | 'health' | 'readiness';

type Props = {
  guildOptions: string[];
  attendanceCount: number;
  checkInRate: number;
  totalCheckIns: number;
  activeMembers: number;
  recentEventTitle: string;
  recentEventAt: string;
  totalAnnouncements: number;
  totalAnnouncementViews: number;
  avgAnnouncementViews: number;
  recentAnnouncementTitle: string;
  recentAnnouncementAt: string;
  mostViewedAnnouncement: string;
  mostViewedCount: number;
  healthStatus: boolean;
  checklistStatus: boolean;
  checklistMissing: string[];
};

const WIDGETS: Array<{ key: WidgetKey; label: string }> = [
  { key: 'attendance', label: '출석 수' },
  { key: 'checkin', label: '체크인율' },
  { key: 'members', label: '활성 멤버' },
  { key: 'event', label: '최근 이벤트' },
  { key: 'announcements', label: '공지 도달' },
  { key: 'health', label: '운영 상태' },
  { key: 'readiness', label: '릴리즈 readiness' },
];

function storageKey(guildId: string) {
  return `guildops-dashboard-widgets:${guildId}`;
}

function readEnabled(guildId: string): WidgetKey[] {
  try {
    const raw = localStorage.getItem(storageKey(guildId));
    if (!raw) return WIDGETS.map((w) => w.key);
    const parsed = JSON.parse(raw) as WidgetKey[];
    return parsed.length ? parsed : WIDGETS.map((w) => w.key);
  } catch {
    return WIDGETS.map((w) => w.key);
  }
}

export function DashboardCustomizer(props: Props) {
  const initialGuild = props.guildOptions[0] ?? 'guild-default';
  const [guildId, setGuildId] = useState(initialGuild);
  const [enabled, setEnabled] = useState<WidgetKey[]>(() => readEnabled(initialGuild));

  const enabledSet = useMemo(() => new Set(enabled), [enabled]);

  function onGuildChange(nextGuild: string) {
    setGuildId(nextGuild);
    setEnabled(readEnabled(nextGuild));
  }

  function toggleWidget(key: WidgetKey) {
    const next = enabledSet.has(key) ? enabled.filter((k) => k !== key) : [...enabled, key];
    const normalized = next.length ? next : [key];
    setEnabled(normalized);
    localStorage.setItem(storageKey(guildId), JSON.stringify(normalized));
  }

  return (
    <>
      <section style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Dashboard Customization</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={guildId} onChange={(e) => onGuildChange(e.target.value)}>
            {props.guildOptions.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          {WIDGETS.map((widget) => (
            <label key={widget.key} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={enabledSet.has(widget.key)}
                onChange={() => toggleWidget(widget.key)}
              />
              {widget.label}
            </label>
          ))}
        </div>
      </section>

      <section className="kpi-grid" aria-label="KPI Widgets">
        {enabledSet.has('attendance') ? (
          <article className="kpi-card">
            <h3>출석 수</h3>
            <p className="kpi-value">{props.attendanceCount}</p>
            <p className="kpi-note">전체 출석 이벤트</p>
          </article>
        ) : null}

        {enabledSet.has('checkin') ? (
          <article className="kpi-card">
            <h3>체크인율</h3>
            <p className="kpi-value">{props.checkInRate}%</p>
            <p className="kpi-note">총 체크인 {props.totalCheckIns}건 기준</p>
          </article>
        ) : null}

        {enabledSet.has('members') ? (
          <article className="kpi-card">
            <h3>활성 멤버</h3>
            <p className="kpi-value">{props.activeMembers}</p>
            <p className="kpi-note">active=true 멤버 수</p>
          </article>
        ) : null}

        {enabledSet.has('event') ? (
          <article className="kpi-card">
            <h3>최근 이벤트</h3>
            <p className="kpi-value kpi-value-small">{props.recentEventTitle}</p>
            <p className="kpi-note">{props.recentEventAt}</p>
          </article>
        ) : null}

        {enabledSet.has('announcements') ? (
          <article className="kpi-card">
            <h3>공지 도달</h3>
            <p className="kpi-value">{props.totalAnnouncementViews}</p>
            <p className="kpi-note">총 조회수 ({props.totalAnnouncements}개 공지)</p>
            {props.totalAnnouncements > 0 && (
              <>
                <p className="kpi-value kpi-value-small">{props.avgAnnouncementViews}</p>
                <p className="kpi-note">평균 조회수</p>
                {props.mostViewedAnnouncement !== '공지 없음' ? (
                  <>
                    <p className="kpi-value kpi-value-small">{props.mostViewedAnnouncement}</p>
                    <p className="kpi-note">최다 조회 ({props.mostViewedCount}회)</p>
                  </>
                ) : null}
              </>
            )}
          </article>
        ) : null}

        {enabledSet.has('health') ? (
          <article className="kpi-card">
            <h3>운영 상태</h3>
            <p className={`kpi-value kpi-value-small ${props.healthStatus && props.checklistStatus ? 'status-ok' : 'status-warn'}`}>
              {props.healthStatus && props.checklistStatus ? 'API/DEMO 정상' : '점검 필요'}
            </p>
            <p className="kpi-note">
              auth: {props.healthStatus ? 'ok' : 'fail'} · demo: {props.checklistStatus ? 'ok' : `missing ${props.checklistMissing.length}`}
            </p>
            {!props.checklistStatus && props.checklistMissing.length > 0 ? (
              <p className="kpi-note">누락: {props.checklistMissing.join(', ')}</p>
            ) : null}
          </article>
        ) : null}

        {enabledSet.has('readiness') ? <ReleaseReadinessCard /> : null}
      </section>
    </>
  );
}
