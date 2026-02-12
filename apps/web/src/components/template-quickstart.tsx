'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createItem, toUserError } from '../lib/api';

type GuildTemplate = {
  type: string;
  name: string;
  description: string;
  defaults: {
    roles: string[];
    eventCadence: string;
    attendancePolicy: string;
    announcementStyle: string;
  };
};

type EventDraft = {
  title: string;
  cadence: string;
  suggestedDay: string;
  suggestedHour: string;
};

type ApplyReport = {
  createdCount: number;
  createdTitles: string[];
  failedReason?: string;
};

type FollowupPreset = {
  enableOpsAlert: boolean;
  enableWeeklyDigest: boolean;
  createDefaultAnnouncement: boolean;
};

function buildEventDrafts(templateType?: string): EventDraft[] {
  switch (templateType) {
    case 'raid':
      return [
        { title: 'Weekly Raid #1', cadence: 'weekly', suggestedDay: 'Tue', suggestedHour: '21:00' },
        { title: 'Weekly Raid #2', cadence: 'weekly', suggestedDay: 'Thu', suggestedHour: '21:00' },
        { title: 'Strategy Briefing', cadence: 'weekly', suggestedDay: 'Sun', suggestedHour: '20:00' },
      ];
    case 'esports':
      return [
        { title: 'Scrim Block A', cadence: 'weekly', suggestedDay: 'Mon', suggestedHour: '20:00' },
        { title: 'Scrim Block B', cadence: 'weekly', suggestedDay: 'Wed', suggestedHour: '20:00' },
        { title: 'Replay Review', cadence: 'weekly', suggestedDay: 'Fri', suggestedHour: '21:00' },
      ];
    default:
      return [
        { title: 'Community Night', cadence: 'weekly', suggestedDay: 'Sat', suggestedHour: '20:00' },
        { title: 'Monthly Meetup', cadence: 'monthly', suggestedDay: '1st Sun', suggestedHour: '19:00' },
      ];
  }
}

export function TemplateQuickstart({ templates }: { templates: GuildTemplate[] }) {
  const searchParams = useSearchParams();
  const guildId = searchParams.get('guildId');

  const [selectedType, setSelectedType] = useState<string>(templates[0]?.type ?? '');
  const [guildName, setGuildName] = useState<string>('');
  const [game, setGame] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  const [applyReport, setApplyReport] = useState<ApplyReport | null>(null);
  const [followupPreset, setFollowupPreset] = useState<FollowupPreset>({
    enableOpsAlert: true,
    enableWeeklyDigest: true,
    createDefaultAnnouncement: true,
  });

  const selectedTemplate = useMemo(
    () => templates.find((template: GuildTemplate) => template.type === selectedType) ?? templates[0],
    [selectedType, templates],
  );

  const eventDrafts = useMemo(() => buildEventDrafts(selectedTemplate?.type), [selectedTemplate?.type]);

  useEffect(() => {
    const key = selectedTemplate?.type ? `guildops:followup:${selectedTemplate.type}` : null;
    if (!key) return;

    const saved = globalThis.localStorage.getItem(key);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as FollowupPreset;
      setFollowupPreset({
        enableOpsAlert: parsed.enableOpsAlert !== false,
        enableWeeklyDigest: parsed.enableWeeklyDigest !== false,
        createDefaultAnnouncement: parsed.createDefaultAnnouncement !== false,
      });
    } catch {
      // ignore broken local draft
    }
  }, [selectedTemplate?.type]);

  useEffect(() => {
    const key = selectedTemplate?.type ? `guildops:followup:${selectedTemplate.type}` : null;
    if (!key) return;
    globalThis.localStorage.setItem(key, JSON.stringify(followupPreset));
  }, [followupPreset, selectedTemplate?.type]);

  const draft = {
    guild: {
      name: guildName || `${selectedTemplate?.name ?? 'New'} 길드`,
      game: game || selectedTemplate?.type?.toUpperCase() || 'GENERAL',
      templateType: selectedTemplate?.type,
      guildId,
    },
    defaults: selectedTemplate?.defaults,
    calendarDraft: eventDrafts,
    followupPreset,
  };

  async function handleApplyTemplate() {
    if (!guildId) {
      setApplyMessage('guildId가 필요합니다. 상단 GuildSwitcher에서 길드를 선택해 주세요.');
      return;
    }

    if (!selectedTemplate?.type) {
      setApplyMessage('템플릿 타입을 선택해 주세요.');
      return;
    }

    setSubmitting(true);
    setApplyMessage(null);
    setApplyReport(null);
    try {
      const result = await createItem('events/template-apply', {
        guildId,
        templateType: selectedTemplate.type,
        anchorDate: new Date().toISOString(),
      });
      const payload = result as { createdCount?: number; created?: Array<{ title?: string }> };
      const createdCount = Number(payload?.createdCount ?? 0);
      const createdTitles = Array.isArray(payload?.created)
        ? payload.created.map((item: { title?: string }) => item.title ?? 'untitled')
        : [];

      setApplyMessage(`템플릿 스케줄 적용 완료: ${createdCount}개 이벤트 생성`);
      setApplyReport({ createdCount, createdTitles });
    } catch (error) {
      const reason = toUserError(error);
      setApplyMessage(`적용 실패: ${reason}`);
      setApplyReport({ createdCount: 0, createdTitles: [], failedReason: reason });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ marginTop: 16 }}>
      <h3 style={{ marginTop: 0 }}>Template Quickstart</h3>
      <p className="kpi-note">템플릿 선택 시 길드 생성 초안이 자동으로 프리필됩니다.</p>

      <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
        <label>
          Template
          <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} style={{ marginLeft: 8 }}>
            {templates.map((template: GuildTemplate) => (
              <option key={template.type} value={template.type}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Guild Name
          <input
            value={guildName}
            onChange={(event) => setGuildName(event.target.value)}
            placeholder={`${selectedTemplate?.name ?? 'Template'} 길드`}
            style={{ marginLeft: 8, minWidth: 260 }}
          />
        </label>

        <label>
          Game
          <input
            value={game}
            onChange={(event) => setGame(event.target.value)}
            placeholder={selectedTemplate?.type?.toUpperCase() ?? 'GENERAL'}
            style={{ marginLeft: 8, minWidth: 180 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 10 }}>
        <strong>Calendar Draft Suggestion</strong>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {eventDrafts.map((eventDraft: EventDraft) => (
            <li key={`${eventDraft.title}-${eventDraft.suggestedDay}`}>
              {eventDraft.title} · {eventDraft.cadence} · {eventDraft.suggestedDay} {eventDraft.suggestedHour}
            </li>
          ))}
        </ul>
      </div>

      <section style={{ marginTop: 10, border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
        <strong>Post-Apply Auto Setup (MVP)</strong>
        <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
          <label>
            <input
              type="checkbox"
              checked={followupPreset.enableOpsAlert}
              onChange={(event) =>
                setFollowupPreset((prev: FollowupPreset) => ({ ...prev, enableOpsAlert: event.target.checked }))
              }
            />{' '}
            운영 알림 자동화 활성화
          </label>
          <label>
            <input
              type="checkbox"
              checked={followupPreset.enableWeeklyDigest}
              onChange={(event) =>
                setFollowupPreset((prev: FollowupPreset) => ({ ...prev, enableWeeklyDigest: event.target.checked }))
              }
            />{' '}
            주간 운영 리포트 digest 활성화
          </label>
          <label>
            <input
              type="checkbox"
              checked={followupPreset.createDefaultAnnouncement}
              onChange={(event) =>
                setFollowupPreset((prev: FollowupPreset) => ({ ...prev, createDefaultAnnouncement: event.target.checked }))
              }
            />{' '}
            기본 공지 템플릿 자동 생성
          </label>
        </div>
      </section>

      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={handleApplyTemplate} disabled={submitting}>
          {submitting ? '적용 중...' : '템플릿 스케줄 실제 생성'}
        </button>
        <span className="kpi-note">현재 guildId: {guildId ?? '선택 필요'}</span>
      </div>
      {applyMessage ? <p className="kpi-note" style={{ marginTop: 6 }}>{applyMessage}</p> : null}

      {applyReport ? (
        <section style={{ marginTop: 10, border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
          <strong>Apply Result Report</strong>
          <p className="kpi-note" style={{ marginTop: 6 }}>
            생성 건수: {applyReport.createdCount}
          </p>
          {applyReport.createdTitles.length > 0 ? (
            <ul style={{ marginTop: 6, paddingLeft: 18 }}>
              {applyReport.createdTitles.map((title: string) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          ) : null}
          {applyReport.failedReason ? (
            <p className="kpi-note" style={{ marginTop: 6 }}>
              실패 사유: {applyReport.failedReason}
            </p>
          ) : null}
        </section>
      ) : null}

      <pre style={{ marginTop: 10, background: '#0f162c', padding: 10, borderRadius: 8, border: '1px solid var(--border)', overflowX: 'auto' }}>
{JSON.stringify(draft, null, 2)}
      </pre>
    </section>
  );
}
