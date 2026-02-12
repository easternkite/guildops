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

export function TemplateQuickstart({ templates }: { templates: GuildTemplate[] }) {
  const [selectedType, setSelectedType] = useState<string>(templates[0]?.type ?? '');
  const [guildName, setGuildName] = useState<string>('');
  const [game, setGame] = useState<string>('');

  const selectedTemplate = useMemo(
    () => templates.find((template: GuildTemplate) => template.type === selectedType) ?? templates[0],
    [selectedType, templates],
  );

  const draft = {
    guild: {
      name: guildName || `${selectedTemplate?.name ?? 'New'} 길드`,
      game: game || selectedTemplate?.type?.toUpperCase() || 'GENERAL',
      templateType: selectedTemplate?.type,
    },
    defaults: selectedTemplate?.defaults,
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

      <pre style={{ marginTop: 10, background: '#0f162c', padding: 10, borderRadius: 8, border: '1px solid var(--border)', overflowX: 'auto' }}>
{JSON.stringify(draft, null, 2)}
      </pre>
    </section>
  );
}
