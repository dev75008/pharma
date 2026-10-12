import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import record from '../../e2e/fixtures/regulatory-drug.json';
import { db } from './db';
import { cachedCatalogRecord, loadCatalog, recentCatalogSearches } from './catalog';
import { catalogRequest, fetchCatalog, type ApiCacheEntry } from '../data/adapters/medicamentsApi';
vi.mock('../data/adapters/medicamentsApi',async(original)=>({...await original<typeof import('../data/adapters/medicamentsApi')>(),fetchCatalog:vi.fn()}));
beforeEach(async()=>{await db.apiCache.clear();vi.mocked(fetchCatalog).mockReset();vi.spyOn(navigator,'onLine','get').mockReturnValue(true);});
afterEach(()=>vi.restoreAllMocks());
function snapshot(input='60524826'):ApiCacheEntry {return {key:catalogRequest(input).key,schemaVersion:1,records:[record],retrievedAt:'2026-10-12T18:00:00.000Z',sourceSyncedAt:null,expiresAt:Date.now()+3600000};}

it('sauvegarde la réponse puis sert le cache après réouverture sans appel réseau',async()=>{
 vi.mocked(fetchCatalog).mockResolvedValue(snapshot());
 expect((await loadCatalog('60524826')).origin).toBe('network');
 db.close();await db.open();
 expect((await loadCatalog('60524826')).origin).toBe('cache');
 expect(fetchCatalog).toHaveBeenCalledTimes(1);
});
it('préserve date et provenance de la copie ancienne si le réseau échoue',async()=>{
 const old={...snapshot(),expiresAt:0};await db.apiCache.put(old);
 vi.mocked(fetchCatalog).mockRejectedValue(new Error('HTTP 503'));
 const result=await loadCatalog('60524826',true);
 expect(result.stale).toBe(true);expect(result.entry.retrievedAt).toBe(old.retrievedAt);expect(result.warning).toContain('HTTP 503');
});
it('consulte une copie expirée hors ligne et refuse une recherche non téléchargée',async()=>{
 await db.apiCache.put({...snapshot(),expiresAt:0});vi.spyOn(navigator,'onLine','get').mockReturnValue(false);
 expect((await loadCatalog('60524826')).stale).toBe(true);
 await expect(loadCatalog('ramipril')).rejects.toThrow('pas encore été téléchargée');expect(fetchCatalog).not.toHaveBeenCalled();
});
it('ignore un cache dont le CIS ne correspond pas et refuse les saisies invalides avant le réseau',async()=>{
 await db.apiCache.put({...snapshot(),records:[{...record,cis:61599041,composition:null,presentation:null,generiques:null}]});
 vi.mocked(fetchCatalog).mockResolvedValue(snapshot());expect((await loadCatalog('60524826')).origin).toBe('network');
 await expect(loadCatalog('a&b')).rejects.toThrow('Saisissez');expect(fetchCatalog).toHaveBeenCalledTimes(1);
});
it('partage les requêtes concurrentes identiques',async()=>{
 vi.mocked(fetchCatalog).mockImplementation(async()=>{await new Promise(resolve=>setTimeout(resolve,20));return snapshot();});
 await Promise.all([loadCatalog('60524826',true),loadCatalog('60524826',true)]);
 expect(fetchCatalog).toHaveBeenCalledTimes(1);
});
it('borne le cache à cinquante recherches en supprimant la plus ancienne',async()=>{
 const entries=Array.from({length:50},(_,i)=>({...snapshot(`bisoprolol ${i}`),retrievedAt:new Date(Date.UTC(2026,9,12,0,0,i)).toISOString()}));
 await db.apiCache.bulkPut(entries);
 vi.mocked(fetchCatalog).mockResolvedValue({...snapshot('bisoprolol 50'),retrievedAt:'2026-10-12T18:00:00.000Z'});
 await loadCatalog('bisoprolol 50');
 expect(await db.apiCache.count()).toBe(50);
 expect(await db.apiCache.get(entries[0].key)).toBeUndefined();
});
it('réutilise le CIS exact depuis une recherche, avec la provenance initiale',async()=>{
 await db.apiCache.put(snapshot('bisoprolol'));
 const result=await cachedCatalogRecord('60524826');
 expect(result?.entry.key).toBe('/v1/medicaments?search=bisoprolol');
 expect(result?.entry.records[0].cis).toBe(60524826);
 expect(await cachedCatalogRecord('61599041')).toBeNull();
 expect((await recentCatalogSearches())[0].term).toBe('bisoprolol');expect(fetchCatalog).not.toHaveBeenCalled();
});
