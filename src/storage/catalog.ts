import { db } from './db';
import { apiCacheSchema, catalogRequest, fetchCatalog, parseCatalogResponse, MedicamentsApiError, type ApiCacheEntry, type CatalogRequest } from '../data/adapters/medicamentsApi';

export interface CatalogResult { entry:ApiCacheEntry; origin:'network'|'cache'; stale:boolean; warning:string; }
const pending=new Map<string,Promise<ApiCacheEntry>>();
async function download(request:CatalogRequest) {
 const existing=pending.get(request.key);if(existing)return existing;
 const job=fetchCatalog(request);pending.set(request.key,job);
 try {return await job;} finally {pending.delete(request.key);}
}
export async function loadCatalog(input:string,force=false):Promise<CatalogResult> {
 const request=catalogRequest(input);let cached:ApiCacheEntry|undefined;let cacheWarning='';
 try {
  const parsed=apiCacheSchema.safeParse(await db.apiCache.get(request.key));
  if(parsed.success&&parsed.data.key===request.key&&(request.kind==='search'||parsed.data.records.length===1)) {
   try {parseCatalogResponse(request.kind==='search'?parsed.data.records:parsed.data.records[0],request);cached=parsed.data;}catch{cacheWarning='Copie locale incohérente ignorée.';}
  }
 }catch{cacheWarning='Le cache local est indisponible.';}
 const offline=typeof navigator!=='undefined'&&!navigator.onLine;
 if(cached&&(offline||!force&&cached.expiresAt>Date.now()))return {entry:cached,origin:'cache',stale:cached.expiresAt<=Date.now(),warning:offline?'Consultation hors ligne de la copie téléchargée.':''};
 if(offline)throw new MedicamentsApiError('Hors ligne : cette recherche n’a pas encore été téléchargée.','network');
 try {
  const entry=await download(request);
  try {
   await db.transaction('rw',db.apiCache,async()=>{
    await db.apiCache.put(entry);
    // Limite de stockage technique : 50 recherches, pas la base complète.
    const extra=await db.apiCache.orderBy('retrievedAt').reverse().offset(50).primaryKeys();
    if(extra.length)await db.apiCache.bulkDelete(extra);
   });
  }catch{cacheWarning='Données reçues, mais sauvegarde hors ligne impossible sur cet appareil.';}
  return {entry,origin:'network',stale:false,warning:cacheWarning};
 }catch(error){
  if(cached)return {entry:cached,origin:'cache',stale:true,warning:`${error instanceof Error?error.message:'API indisponible.'} Copie précédente conservée, sans nouvelle date de récupération.`};
  throw error;
 }
}
