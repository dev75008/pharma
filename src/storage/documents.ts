import { db } from './db';
import { documentCacheSchema, documentPath, fetchDocument, type DocumentCacheEntry, type DocumentKind } from '../data/adapters/ansmDocuments';
import { MedicamentsApiError } from '../data/adapters/medicamentsApi';

export interface DocumentResult {entry:DocumentCacheEntry;origin:'network'|'cache';stale:boolean;warning:string;}
const pending=new Map<string,Promise<DocumentCacheEntry>>();
export async function loadDocument(cis:string,kind:DocumentKind,force=false):Promise<DocumentResult> {
 documentPath(cis,kind);const key=`${cis}:${kind}`;let cached:DocumentCacheEntry|undefined;
 try {const parsed=documentCacheSchema.safeParse(await db.apiDocuments.get(key));if(parsed.success&&parsed.data.key===key)cached=parsed.data;}catch{/* Le réseau reste disponible si IndexedDB est bloqué. */}
 const offline=typeof navigator!=='undefined'&&!navigator.onLine;
 if(cached&&(offline||!force&&cached.expiresAt>Date.now()))return {entry:cached,origin:'cache',stale:cached.expiresAt<=Date.now(),warning:offline?'Document téléchargé : lecture hors ligne.':''};
 if(offline)throw new MedicamentsApiError('Hors ligne : ce document n’a pas encore été téléchargé.','network');
 try {
  let job=pending.get(key);
  if(!job){job=fetchDocument(cis,kind).finally(()=>pending.delete(key));pending.set(key,job);}
  const entry=await job;let warning='';
  try {await db.transaction('rw',db.apiDocuments,async()=>{await db.apiDocuments.put(entry);const old=await db.apiDocuments.orderBy('retrievedAt').reverse().offset(20).primaryKeys();if(old.length)await db.apiDocuments.bulkDelete(old);});}
  catch{warning='Lecture possible, mais enregistrement hors ligne impossible.';}
  return {entry,origin:'network',stale:false,warning};
 }catch(error){if(cached)return {entry:cached,origin:'cache',stale:true,warning:`${error instanceof Error?error.message:'API indisponible.'} Ancienne copie datée conservée.`};throw error;}
}
