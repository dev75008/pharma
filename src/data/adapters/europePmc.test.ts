import { afterEach,expect,it,vi } from 'vitest';
import fixture from '../../../e2e/fixtures/europe-pmc.json';
import { fetchLiterature,literatureCacheSchema,literatureRequest } from './europePmc';
afterEach(()=>vi.restoreAllMocks());
let clock=Date.now();
function advance(){clock+=120000;vi.spyOn(Date,'now').mockReturnValue(clock);}
it('emploie un terme explicite et refuse les identifiants inconnus',()=>{
 expect(literatureRequest('paracetamol').query).toBe('TITLE_ABS:"acetaminophen" AND SRC:MED');
 expect(()=>literatureRequest('inconnu')).toThrow();
});
it('valide la réponse réelle et ne conserve ni résumé ni champs tiers',async()=>{
 advance();const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify(fixture)));
 const entry=await fetchLiterature('bisoprolol',fetcher);
 expect(entry.citations).toHaveLength(10);expect(entry.sourceId).toBe('europepmc');expect(entry.sourceUpdatedAt).toBeNull();
 expect(entry.citations[0]).not.toHaveProperty('abstractText');expect(fetcher.mock.calls[0][1].credentials).toBe('omit');
 expect(literatureCacheSchema.safeParse({...entry,key:'ramipril'}).success).toBe(false);
});
it('rejette une réponse provenant d’une autre recherche',async()=>{
 advance();await expect(fetchLiterature('ramipril',vi.fn().mockResolvedValue(new Response(JSON.stringify(fixture))))).rejects.toThrow('recherche différente');
});
it('respecte le ralentissement après 429 sans répétition automatique',async()=>{
 advance();const fetcher=vi.fn().mockResolvedValue(new Response('',{status:429}));
 await expect(fetchLiterature('bisoprolol',fetcher)).rejects.toThrow('une minute');
 await expect(fetchLiterature('bisoprolol',fetcher)).rejects.toThrow('attendez');expect(fetcher).toHaveBeenCalledTimes(1);
});
