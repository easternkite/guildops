import { z } from 'zod';
export const GuildSchema = z.object({ id: z.string(), name: z.string(), game: z.string(), createdAt: z.string() });
export const MemberSchema = z.object({ id: z.string(), guildId: z.string(), nickname: z.string(), role: z.string(), active: z.boolean() });
export const EventSchema = z.object({ id: z.string(), guildId: z.string(), title: z.string(), startsAt: z.string(), status: z.string() });
export type Guild = z.infer<typeof GuildSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type Event = z.infer<typeof EventSchema>;
