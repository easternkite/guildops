'use client';

import { useMemo, useState } from 'react';
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

  const selectedTemplate = useMemo(
    () => templates.find((template: GuildTemplate) => template.type === selectedType) ?? templates[0],
    [selectedType, templates],
  );

  const eventDrafts = useMemo(() => buildEventDrafts(selectedTemplate?.type), [selectedTemplate?.type]);

  const draft = {
    guild: {
      name: guildName || `${selectedTemplate?.name ?? 'New'} 길드`,
      game: game || selectedTemplate?.type?.toUpperCase() || 'GENERAL',
      templateType: selectedTemplate?.type,
      guildId,
    },
    defaults: selectedTemplate?.defaults,
    calendarDraft: eventDrafts,
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
    try {
      const result = await createItem('events/template-apply', {
        guildId,
        templateType: selectedTemplate.type,
        anchorDate: new Date().toISOString(),
      });
      const createdCount = Number((result as { createdCount?: number })?.createdCount ?? 0);
      setApplyMessage(`템플릿 스케줄 적용 완료: ${createdCount}개 이벤트 생성`);
    } catch (error) {
      setApplyMessage(`적용 실패: ${toUserError(error)}`);
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

      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={handleApplyTemplate} disabled={submitting}>
          {submitting ? '적용 중...' : '템플릿 스케줄 실제 생성'}
        </button>
        <span className="kpi-note">현재 guildId: {guildId ?? '선택 필요'}</span>
      </div>
      {applyMessage ? <p className="kpi-note" style={{ marginTop: 6 }}>{applyMessage}</p> : null}

      <pre style={{ marginTop: 10, background: '#0f162c', padding: 10, borderRadius: 8, border: '1px solid var(--border)', overflowX: 'auto' }}>
{JSON.stringify(draft, null, 2)}
      </pre>
    </section>
  );
}
