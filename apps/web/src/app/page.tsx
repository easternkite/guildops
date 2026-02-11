import Link from 'next/link';
export default function Home() { return <main><h1>GuildOps</h1><ul><li><Link href="/dashboard">Dashboard</Link></li><li><Link href="/members">Members</Link></li><li><Link href="/events">Events</Link></li><li><Link href="/announcements">Announcements</Link></li></ul></main>; }
