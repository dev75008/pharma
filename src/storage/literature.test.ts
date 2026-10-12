import { beforeEach,afterEach,expect,it,vi } from 'vitest';
import fixture from '../../e2e/fixtures/europe-pmc.json';
import { db } from './db';
import { fetchLiterature,literatureRequest,type LiteratureCache } from '../data/adapters/europePmc';
import { loadLiterature } from './literature';
vi.mock('../data/adapters/europePmc',async(original)=>({...await original<typeof import('../data/adapters/europePmc')>(),fetchLiterature:vi.fn()}));
const entry=():LiteratureCache=>({key:'bisoprolol',schemaVersion:1,sourceId:'europepmc',...literatureRequest('bisoprolol'),hitCount:fixture.hitCount,citations:fixture.resultList.result.map(c=>({...c,source:'MED',isOpenAccess:c.isOpenAccess as 'Y'|'N'})),retrievedAt:'2026-10-12T20:00:00.000Z',sourceUpdatedAt:null,expiresAt:Date.now()+86400000});
beforeEach(async()=>{await db.literature.clear();vi.mocked(fetchLiterature).mockReset();vi.spyOn(navigator,'onLine','get').mockReturnValue(true);});
afterEach(()=>vi.restoreAllMocks());
it('déduplique, sauvegarde et relit hors ligne sans réseau',async()=>{
 vi.mocked(fetchLiterature).mockResolvedValue(entry());await Promise.all([loadLiterature('bisoprolol'),loadLiterature('bisoprolol')]);
 expect(fetchLiterature).toHaveBeenCalledTimes(1);db.close();await db.open();vi.spyOn(navigator,'onLine','get').mockReturnValue(false);
 const result=await loadLiterature('bisoprolol');expect(result.warning).toContain('hors ligne');expect(result.entry.retrievedAt).toBe('2026-10-12T20:00:00.000Z');
 await expect(loadLiterature('ramipril')).rejects.toThrow('aucune bibliographie');
});
it('préserve une copie périmée si le réseau échoue',async()=>{
 await db.literature.put({...entry(),expiresAt:0});vi.mocked(fetchLiterature).mockRejectedValue(new Error('HTTP 503'));
 const result=await loadLiterature('bisoprolol',true);expect(result.stale).toBe(true);expect(result.warning).toContain('HTTP 503');expect(result.entry.retrievedAt).toBe(entry().retrievedAt);
});
it('ignore un cache dont la recherche et la molécule ne concordent pas',async()=>{
 await db.literature.put({...entry(),key:'ramipril'});vi.spyOn(navigator,'onLine','get').mockReturnValue(false);
 await expect(loadLiterature('ramipril')).rejects.toThrow('aucune bibliographie');
});
