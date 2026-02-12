'use client';

import { useMemo, useState } from 'react';

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
  const [selectedType, setSelectedType] = useState<string>(templates[0]?.type ?? '');
  const [guildName, setGuildName] = useState<string>('');
  const [game, setGame] = useState<string>('');

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
    },
    defaults: selectedTemplate?.defaults,
    calendarDraft: eventDrafts,
  };

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

      <pre style={{ marginTop: 10, background: '#0f162c', padding: 10, borderRadius: 8, border: '1px solid var(--border)', overflowX: 'auto' }}>
{JSON.stringify(draft, null, 2)}
      </pre>
    </section>
  );
}
