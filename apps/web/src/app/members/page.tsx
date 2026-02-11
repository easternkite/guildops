import { getList } from '../../lib/api';
export default async function MembersPage(){ const items = await getList('members').catch(()=>[]); return <main><h2>Members</h2><pre>{JSON.stringify(items,null,2)}</pre></main>; }
