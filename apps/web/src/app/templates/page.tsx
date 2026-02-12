import { Suspense, useState } from 'react';
import { TemplateQuickstart } from '../../components/template-quickstart';
import { TemplateCreator, CustomTemplatesList } from '../../components/template-creator';
import { getList } from '../../lib/api';

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

type CustomTemplate = {
  id: string;
  type: string;
  name: string;
  description: string;
  defaults: {
    roles: string[];
    eventCadence: string;
    attendancePolicy: string;
    announcementStyle: string;
  };
  createdAt: string;
};

const STORAGE_KEY = 'guildops-custom-templates';

function loadCustomTemplates(): CustomTemplate[] {
  try {
    const saved = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    return JSON.parse(saved) as CustomTemplate[];
  } catch {
    return [];
  }
}

function deleteCustomTemplate(id: string) {
  const templates = loadCustomTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export default async function TemplatesPage() {
  const templates = await getList('guilds/templates').catch(() => [] as GuildTemplate[]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(loadCustomTemplates());

  function handleRefreshCustom() {
    setCustomTemplates(loadCustomTemplates());
  }

  function handleTemplateCreated() {
    setCustomTemplates(loadCustomTemplates());
  }

  function handleDeleteTemplate(id: string) {
    deleteCustomTemplate(id);
    setCustomTemplates(loadCustomTemplates());
  }

  return (
    <main>
      <h2>Guild Templates</h2>
      <p className="dashboard-subtitle">길드 유형별 운영 기본 규칙을 빠르게 비교</p>

      <section style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>기본 제공 템플릿</h3>
        {templates.length === 0 ? (
          <p className="kpi-note">템플릿을 불러오지 못했습니다.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {templates.map((template: GuildTemplate) => (
              <article key={template.type} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                <h3 style={{ margin: 0 }}>{template.name}</h3>
                <p className="kpi-note" style={{ marginTop: 6 }}>{template.description}</p>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                  <li>역할: {template.defaults.roles.join(', ')}</li>
                  <li>이벤트 주기: {template.defaults.eventCadence}</li>
                  <li>출석 정책: {template.defaults.attendancePolicy}</li>
                  <li>공지 스타일: {template.defaults.announcementStyle}</li>
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ marginTop: 0 }}>사용자 템플릿</h3>
          <button type="button" onClick={handleRefreshCustom}>
            새로고침
          </button>
        </div>
        {customTemplates.length === 0 ? (
          <p className="kpi-note" style={{ marginTop: 8 }}>
            저장된 사용자 템플릿이 없습니다.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {customTemplates.map((template: CustomTemplate) => (
              <article
                key={template.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 12,
                  background: 'var(--panel-bg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{template.name}</strong>
                    <p className="kpi-note" style={{ marginTop: 6 }}>
                      {template.description}
                    </p>
                    <p className="kpi-note" style={{ marginTop: 4 }}>
                      타입: {template.type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(template.id)}
                    style={{
                      padding: '4px 8px',
                      background: '#f43f5e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    삭제
                  </button>
                </div>
                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  <li>역할: {template.defaults.roles.join(', ')}</li>
                  <li>이벤트 주기: {template.defaults.eventCadence}</li>
                  <li>출석 정책: {template.defaults.attendancePolicy}</li>
                  <li>공지 스타일: {template.defaults.announcementStyle}</li>
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>

      <TemplateCreator onCreated={handleTemplateCreated} />

      <Suspense fallback={null}>
        <TemplateQuickstart templates={templates} />
      </Suspense>
    </main>
  );
}
