import { getList } from '@/lib/api';
export default async function AnnouncementsPage(){ const items = await getList('announcements').catch(()=>[]); return <main><h2>Announcements</h2><pre>{JSON.stringify(items,null,2)}</pre></main>; }
