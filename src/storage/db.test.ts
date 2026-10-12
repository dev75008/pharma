import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { beforeEach,describe,it,expect } from 'vitest';
import { db,librarySnapshot,recordVisit,saveNote,setStudied,toggleFavorite,readPreferences,savePreferences } from './db';
beforeEach(async()=>{await db.transaction('rw',db.favorites,db.history,db.progress,db.notes,async()=>{await db.favorites.clear();await db.history.clear();await db.progress.clear();await db.notes.clear();});});
describe('IndexedDB versionné',()=>{
 it('conserve les préférences de version 1 pendant la migration',async()=>{db.close();await Dexie.delete('medrevision');const old=new Dexie('medrevision');old.version(1).stores({preferences:'id'});await old.table('preferences').put({id:'user',theme:'dark',weeklyGoal:180});old.close();await db.open();expect((await readPreferences()).theme).toBe('dark');expect(await db.favorites.count()).toBe(0);});
 it('enregistre favoris, consultations, progression et notes puis relit après réouverture',async()=>{await savePreferences({id:'user',theme:'light',weeklyGoal:120});await toggleFavorite('bisoprolol');await Promise.all([recordVisit('bisoprolol'),recordVisit('bisoprolol')]);await setStudied('bisoprolol',true);await saveNote('bisoprolol','<script>Texte personnel</script>');db.close();await db.open();const snapshot=await librarySnapshot();expect(snapshot.favorites[0].drugId).toBe('bisoprolol');expect(snapshot.history[0].visitCount).toBe(2);expect(snapshot.progress[0].studiedAt).not.toBeNull();expect(snapshot.notes[0].text).toContain('<script>');await toggleFavorite('bisoprolol');await setStudied('bisoprolol',false);expect((await librarySnapshot()).favorites).toEqual([]);expect((await librarySnapshot()).progress[0].studiedAt).toBeNull();});
 it('refuse une note dépassant la limite',async()=>{await expect(saveNote('bisoprolol','x'.repeat(10001))).rejects.toThrow('trop longue');expect(await db.notes.count()).toBe(0);});
});
