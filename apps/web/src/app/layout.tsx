import Link from 'next/link';
import { FeedbackCapture } from '../components/feedback-capture';
import './globals.css';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/members', label: 'Members' },
  { href: '/events', label: 'Events' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/attendance', label: 'Attendance' },
  { href: '/feedback', label: 'Feedback' },
  { href: '/demo-status', label: 'Demo Status' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand">GuildOps</div>
            <nav>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="main-panel">
            <header className="topbar">
              <strong>GuildOps Console</strong>
              <span className="topbar-note">MVP Stabilization</span>
            </header>
            <FeedbackCapture />
            <main className="content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
