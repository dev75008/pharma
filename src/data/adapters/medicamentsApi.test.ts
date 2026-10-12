import { afterEach, describe, expect, it, vi } from 'vitest';
import record from '../../../e2e/fixtures/regulatory-drug.json';
import { catalogRequest, fetchCatalog, parseCatalogResponse, regulatoryDrugSchema, retryTime } from './medicamentsApi';

afterEach(()=>vi.restoreAllMocks());
const response=(value:unknown)=>new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=43200','Last-Modified':'Mon, 12 Oct 2026 18:00:01 GMT'}});
describe('Adaptateur API médicaments v1',()=>{
 it('normalise les accents et distingue nom, CIS et CIP sans injecter de paramètres',()=>{
  expect(catalogRequest('  Paracétamol  500 ').key).toBe('/v1/medicaments?search=paracetamol+500');
  expect(catalogRequest('60524826').kind).toBe('cis');
  expect(catalogRequest('3400935609816').kind).toBe('cip');
  for(const input of ['ab','metformine&cip=1','<script>','a b c d e f g','x'.repeat(51)])expect(()=>catalogRequest(input)).toThrow();
 });
 it('valide une réponse réelle et refuse CIS, CIP ou composition incohérents',()=>{
  expect(parseCatalogResponse(record,catalogRequest('60524826'))[0].composition?.[0].dosage).toBe('10 mg');
  expect(parseCatalogResponse(record,catalogRequest('3400935609816'))).toHaveLength(1);
  expect(()=>parseCatalogResponse(record,catalogRequest('61599041'))).toThrow('CIS');
  expect(()=>parseCatalogResponse(record,catalogRequest('1234567'))).toThrow('CIP');
  expect(()=>parseCatalogResponse([record,record],catalogRequest('bisoprolol'))).toThrow('dupliqués');
  expect(regulatoryDrugSchema.safeParse({...record,composition:[{...record.composition[0],cis:61599041}]}).success).toBe(false);
  expect(regulatoryDrugSchema.safeParse({...record,composition:null,presentation:[{...record.presentation[0],prix:null}]}).success).toBe(true);
 });
 it('emploie l’endpoint documenté sans identifiants et plafonne la validité du cache',async()=>{
  const fetcher=vi.fn<typeof fetch>().mockResolvedValue(response(record));
  const entry=await fetchCatalog(catalogRequest('60524826'),fetcher);
  expect(fetcher).toHaveBeenCalledWith('https://medicaments-api.giygas.dev/v1/medicaments/60524826',expect.objectContaining({credentials:'omit'}));
  expect(entry.expiresAt-Date.parse(entry.retrievedAt)).toBe(14400000);
  expect(entry.sourceSyncedAt).toBe('2026-10-12T18:00:01.000Z');
 });
 it('rejette HTML et données invalides, distingue absence et panne réseau',async()=>{
  const req=catalogRequest('bisoprolol');
  await expect(fetchCatalog(req,vi.fn().mockResolvedValue(new Response('<html/>')))).rejects.toMatchObject({code:'invalid-data'});
  await expect(fetchCatalog(req,vi.fn().mockResolvedValue(response([{cis:'incorrect'}])))).rejects.toMatchObject({code:'invalid-data'});
  await expect(fetchCatalog(req,vi.fn().mockResolvedValue(new Response('',{status:404})))).rejects.toMatchObject({code:'not-found'});
  await expect(fetchCatalog(req,vi.fn().mockRejectedValue(new TypeError('fetch failed')))).rejects.toMatchObject({code:'network'});
 });
 it('respecte 429 et Retry-After sans multiplier les appels',async()=>{
  vi.resetModules();const adapter=await import('./medicamentsApi');
  const fetcher=vi.fn<typeof fetch>().mockResolvedValue(new Response('',{status:429,headers:{'Retry-After':'30'}}));
  await expect(adapter.fetchCatalog(adapter.catalogRequest('bisoprolol'),fetcher)).rejects.toMatchObject({code:'rate-limit'});
  await expect(adapter.fetchCatalog(adapter.catalogRequest('ramipril'),fetcher)).rejects.toMatchObject({code:'rate-limit'});
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(retryTime(null,1000)).toBe(31000);
 });
 it('interrompt un service qui ne répond pas après dix secondes',async()=>{
  vi.useFakeTimers();
  try {
   const fetcher=vi.fn<typeof fetch>().mockImplementation(async(_url,init)=>new Promise((_resolve,reject)=>{
    init?.signal?.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')));
   }));
   const failure=expect(fetchCatalog(catalogRequest('bisoprolol'),fetcher)).rejects.toMatchObject({code:'timeout'});
   await vi.advanceTimersByTimeAsync(10000);await failure;
  } finally {vi.useRealTimers();}
 });
});
