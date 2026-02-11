import Link from 'next/link';
import { AttendanceManager } from '../../components/attendance-manager';
import { getList } from '../../lib/api';

export default async function AttendancePage() {
  const items = await getList('attendance').catch(() => []);

  return (
    <main>
      <h1>Attendance</h1>
      <p>Multi-game attendance schedules and check-ins.</p>
      <p>
        <Link href="/">← Back</Link>
      </p>
      <AttendanceManager initialItems={items} />
    </main>
  );
}
