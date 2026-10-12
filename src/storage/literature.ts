import { db } from './db';
import { fetchLiterature,literatureCacheSchema,literatureRequest,type LiteratureCache } from '../data/adapters/europePmc';
export interface LiteratureResult {entry:LiteratureCache;warning:string;stale:boolean;}
const pending=new Map<string,Promise<LiteratureResult>>();
export async function loadLiterature(drugId:string,force=false):Promise<LiteratureResult>{
 literatureRequest(drugId);const existing=pending.get(drugId);if(existing)return existing;
 const job=readLiterature(drugId,force).finally(()=>pending.delete(drugId));pending.set(drugId,job);return job;
}
async function readLiterature(drugId:string,force:boolean):Promise<LiteratureResult>{
 literatureRequest(drugId);let cached:LiteratureCache|undefined;
 try{const parsed=literatureCacheSchema.safeParse(await db.literature.get(drugId));if(parsed.success&&parsed.data.key===drugId)cached=parsed.data;}catch{/* Lecture réseau possible sans stockage. */}
 const offline=typeof navigator!=='undefined'&&!navigator.onLine;
 if(cached&&(offline||!force&&cached.expiresAt>Date.now()))return {entry:cached,stale:cached.expiresAt<=Date.now(),warning:offline?'Bibliographie téléchargée : consultation hors ligne.':''};
 if(offline)throw new Error('Hors ligne : aucune bibliographie téléchargée pour cette molécule.');
 try{
  const entry=await fetchLiterature(drugId);let warning='';
  try{await db.transaction('rw',db.literature,async()=>{await db.literature.put(entry);const old=await db.literature.orderBy('retrievedAt').reverse().offset(30).primaryKeys();if(old.length)await db.literature.bulkDelete(old);});}catch{warning='Résultats affichés mais sauvegarde hors ligne impossible.';}
  return {entry,stale:false,warning};
 }catch(error){if(cached)return {entry:cached,stale:true,warning:`${error instanceof Error?error.message:'Service indisponible.'} Ancienne bibliographie conservée.`};throw error;}
}
