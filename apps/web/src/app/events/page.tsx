import { getList } from '../../lib/api';
export default async function EventsPage(){ const items = await getList('events').catch(()=>[]); return <main><h2>Events</h2><pre>{JSON.stringify(items,null,2)}</pre></main>; }
