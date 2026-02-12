'use client';

import { useState } from 'react';

type GuildTemplateType = 'raid' | 'esports' | 'community' | 'custom';

type GuildTemplateDefaults = {
  roles: string[];
  eventCadence: string;
  attendancePolicy: string;
  announcementStyle: string;
};

type CustomTemplate = {
  id: string;
  type: GuildTemplateType;
  name: string;
  description: string;
  defaults: GuildTemplateDefaults;
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

function saveCustomTemplates(templates: CustomTemplate[]) {
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function TemplateCreator({ onCreated }: { onCreated?: () => void }) {
  const [type, setType] = useState<GuildTemplateType>('custom');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [roles, setRoles] = useState<string>('');
  const [eventCadence, setEventCadence] = useState('');
  const [attendancePolicy, setAttendancePolicy] = useState('');
  const [announcementStyle, setAnnouncementStyle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const rolesList = roles.split(',').map(r => r.trim()).filter(Boolean);
  const isValid = name.trim() !== '' && description.trim() !== '' && rolesList.length > 0;

  function handleSubmit() {
    if (!isValid) {
      setError('필수 항목(이름, 설명, 역할)을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const templates = loadCustomTemplates();
      const newTemplate: CustomTemplate = {
        id: `custom-${Date.now()}`,
        type,
        name: name.trim(),
        description: description.trim(),
        defaults: {
          roles: rolesList,
          eventCadence: eventCadence.trim(),
          attendancePolicy: attendancePolicy.trim(),
          announcementStyle: announcementStyle.trim(),
        },
        createdAt: new Date().toISOString(),
      };

      templates.push(newTemplate);
      saveCustomTemplates(templates);

      // Reset form
      setType('custom');
      setName('');
      setDescription('');
      setRoles('');
      setEventCadence('');
      setAttendancePolicy('');
      setAnnouncementStyle('');

      if (onCreated) onCreated();
    } catch (err) {
      setError('템플릿 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>새 템플릿 생성</h3>
      <p className="kpi-note">사용자 정의 템플릿을 생성합니다.</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ display: 'grid', gap: 10, marginTop: 10 }}>
        <div>
          <label>
            템플릿 타입
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GuildTemplateType)}
              style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 4 }}
            >
              <option value="custom">사용자 정의</option>
              <option value="raid">레이드</option>
              <option value="esports">이스포츠</option>
              <option value="community">커뮤니티</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            템플릿 이름 *
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: PvP 토너먼트 길드"
              style={{ marginLeft: 8, minWidth: 300, padding: '4px 8px', borderRadius: 4 }}
            />
          </label>
        </div>

        <div>
          <label>
            설명 *
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="템플릿의 목적과 사용 방법을 설명해 주세요."
              rows={3}
              style={{ marginLeft: 8, minWidth: 400, padding: '4px 8px', borderRadius: 4, resize: 'vertical' }}
            />
          </label>
        </div>

        <div>
          <label>
            역할 (쉼표로 구분) *
            <input
              type="text"
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              placeholder="예: LEADER, OFFICER, MEMBER"
              style={{ marginLeft: 8, minWidth: 300, padding: '4px 8px', borderRadius: 4 }}
            />
          </label>
          <p className="kpi-note" style={{ marginTop: 4 }}>
            현재 역할: {rolesList.length > 0 ? rolesList.join(', ') : '없음'}
          </p>
        </div>

        <div>
          <label>
            이벤트 주기
            <input
              type="text"
              value={eventCadence}
              onChange={(e) => setEventCadence(e.target.value)}
              placeholder="예: 주 2회 스케줄"
              style={{ marginLeft: 8, minWidth: 300, padding: '4px 8px', borderRadius: 4 }}
            />
          </label>
        </div>

        <div>
          <label>
            출석 정책
            <input
              type="text"
              value={attendancePolicy}
              onChange={(e) => setAttendancePolicy(e.target.value)}
              placeholder="예: 이벤트 시작 30분 전 체크인"
              style={{ marginLeft: 8, minWidth: 300, padding: '4px 8px', borderRadius: 4 }}
            />
          </label>
        </div>

        <div>
          <label>
            공지 스타일
            <input
              type="text"
              value={announcementStyle}
              onChange={(e) => setAnnouncementStyle(e.target.value)}
              placeholder="예: 이벤트 일정/공지 중심"
              style={{ marginLeft: 8, minWidth: 300, padding: '4px 8px', borderRadius: 4 }}
            />
          </label>
        </div>

        {error && (
          <p style={{ color: '#f43f5e', marginTop: 8 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="submit" disabled={submitting || !isValid}>
            {submitting ? '저장 중...' : '템플릿 생성'}
          </button>
        </div>
      </form>
    </section>
  );
}

export function CustomTemplatesList({ templates, onDelete }: { templates: CustomTemplate[]; onDelete?: (id: string) => void }) {
  if (templates.length === 0) {
    return (
      <p className="kpi-note" style={{ marginTop: 12 }}>
        저장된 사용자 템플릿이 없습니다.
      </p>
    );
  }

  return (
    <section style={{ marginTop: 16 }}>
      <h3 style={{ marginTop: 0 }}>사용자 템플릿 ({templates.length})</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {templates.map((template) => (
          <article
            key={template.id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 10,
              background: 'var(--panel-bg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong>{template.name}</strong>
                <p className="kpi-note" style={{ marginTop: 4 }}>
                  {template.description}
                </p>
                <p className="kpi-note" style={{ marginTop: 4 }}>
                  타입: {template.type}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDelete?.(template.id)}
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
            <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: '0.9em' }}>
              <li>역할: {template.defaults.roles.join(', ')}</li>
              <li>이벤트 주기: {template.defaults.eventCadence}</li>
              <li>출석 정책: {template.defaults.attendancePolicy}</li>
              <li>공지 스타일: {template.defaults.announcementStyle}</li>
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
