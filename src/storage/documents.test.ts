import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import doc from '../../e2e/fixtures/rcp-excerpt.json';
import { db } from './db';
import { ansmDocumentSchema, fetchDocument, type DocumentCacheEntry } from '../data/adapters/ansmDocuments';
import { loadDocument } from './documents';
vi.mock('../data/adapters/ansmDocuments',async(original)=>({...await original<typeof import('../data/adapters/ansmDocuments')>(),fetchDocument:vi.fn()}));
beforeEach(async()=>{await db.apiDocuments.clear();vi.mocked(fetchDocument).mockReset();vi.spyOn(navigator,'onLine','get').mockReturnValue(true);});
afterEach(()=>vi.restoreAllMocks());
const entry=():DocumentCacheEntry=>({key:'60524826:rcp',schemaVersion:1,document:ansmDocumentSchema.parse(doc),retrievedAt:'2026-10-12T18:00:00.000Z',expiresAt:Date.now()+3600000});

it('préserve source et date du document hors ligne, sans appel réseau',async()=>{
 vi.mocked(fetchDocument).mockResolvedValue(entry());await loadDocument('60524826','rcp');
 db.close();await db.open();vi.spyOn(navigator,'onLine','get').mockReturnValue(false);
 const result=await loadDocument('60524826','rcp');
 expect(result.entry.document.miseAJour).toBe('2025-10-20');expect(result.origin).toBe('cache');expect(fetchDocument).toHaveBeenCalledTimes(1);
 await expect(loadDocument('60524826','notice')).rejects.toThrow('pas encore été téléchargé');
});
it('conserve l’ancien document daté lorsque la relecture échoue',async()=>{
 await db.apiDocuments.put({...entry(),expiresAt:0});vi.mocked(fetchDocument).mockRejectedValue(new Error('HTTP 502'));
 const result=await loadDocument('60524826','rcp',true);
 expect(result.stale).toBe(true);expect(result.entry.retrievedAt).toBe('2026-10-12T18:00:00.000Z');expect(result.warning).toContain('HTTP 502');
});
