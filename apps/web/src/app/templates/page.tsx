import { TemplateQuickstart } from '../../components/template-quickstart';
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

export default async function TemplatesPage() {
  const templates = await getList('guilds/templates').catch(() => [] as GuildTemplate[]);

  return (
    <main>
      <h2>Guild Templates</h2>
      <p className="dashboard-subtitle">길드 유형별 운영 기본 규칙을 빠르게 비교</p>

      <section style={{ marginTop: 12 }}>
        {templates.length === 0 ? (
          <p className="kpi-note">템플릿을 불러오지 못했습니다.</p>
        ) : (
          <>
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
            <TemplateQuickstart templates={templates} />
          </>
        )}
      </section>
    </main>
  );
}
