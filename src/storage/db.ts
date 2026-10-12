import Dexie, { type EntityTable } from 'dexie';
import type { DrugHistory, Favorite, StudyNote, UserProgress } from '../domain/models';
export interface Preferences { id: 'user'; theme: 'light' | 'dark'; weeklyGoal: number; }
export const db = new Dexie('medrevision') as Dexie & { preferences: EntityTable<Preferences, 'id'>; favorites: EntityTable<Favorite,'drugId'>; history: EntityTable<DrugHistory,'drugId'>; progress: EntityTable<UserProgress,'drugId'>; notes: EntityTable<StudyNote,'drugId'> };
db.version(1).stores({ preferences: 'id' });
db.version(2).stores({ preferences:'id',favorites:'drugId,createdAt',history:'drugId,lastViewedAt',progress:'drugId,studiedAt',notes:'drugId' });
export const defaultPreferences: Preferences = { id:'user',theme:'light',weeklyGoal:120 };
export async function readPreferences() { return (await db.preferences.get('user')) ?? defaultPreferences; }
export async function savePreferences(value:Preferences) { await db.preferences.put(value); }
export async function toggleFavorite(drugId:string) {await db.transaction('rw',db.favorites,async()=>{if(await db.favorites.get(drugId))await db.favorites.delete(drugId);else await db.favorites.put({drugId,createdAt:new Date().toISOString()});});}
export async function recordVisit(drugId:string) {await db.transaction('rw',db.history,async()=>{const previous=await db.history.get(drugId);await db.history.put({drugId,lastViewedAt:new Date().toISOString(),visitCount:(previous?.visitCount??0)+1});});}
export async function setStudied(drugId:string,studied:boolean) {await db.progress.put({drugId,studiedAt:studied?new Date().toISOString():null});}
export async function saveNote(drugId:string,text:string) {if(text.length>10000)throw new Error('Note trop longue');await db.notes.put({drugId,text,updatedAt:new Date().toISOString()});}
export async function librarySnapshot() {return db.transaction('r',db.favorites,db.history,db.progress,db.notes,async()=>({favorites:await db.favorites.toArray(),history:await db.history.orderBy('lastViewedAt').reverse().limit(20).toArray(),progress:await db.progress.toArray(),notes:await db.notes.toArray()}));}
