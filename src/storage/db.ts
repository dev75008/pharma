import Dexie, { type EntityTable } from 'dexie';
export interface Preferences { id: 'user'; theme: 'light' | 'dark'; weeklyGoal: number; }
export const db = new Dexie('medrevision') as Dexie & { preferences: EntityTable<Preferences, 'id'> };
db.version(1).stores({ preferences: 'id' });
export const defaultPreferences: Preferences = { id: 'user', theme: 'light', weeklyGoal: 120 };
export async function readPreferences() { return (await db.preferences.get('user')) ?? defaultPreferences; }
export async function savePreferences(value: Preferences) { await db.preferences.put(value); }
