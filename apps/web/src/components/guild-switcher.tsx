'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function GuildSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = searchParams.get('guildId') ?? 'all';

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') params.delete('guildId');
    else params.set('guildId', next);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <select value={selected} onChange={(e) => onChange(e.target.value)} aria-label="guild switcher">
      <option value="all">All guilds</option>
      <option value="seed-guild-kr">seed-guild-kr</option>
      <option value="guild-demo">guild-demo</option>
    </select>
  );
}
