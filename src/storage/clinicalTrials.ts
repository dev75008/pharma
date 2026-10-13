import {db} from './db';
import {fetchTrials,trialsCacheSchema,trialsRequest,type TrialFilter,type TrialsCache} from '../data/adapters/clinicalTrials';
export interface TrialsResult {entry:TrialsCache;stale:boolean;warning:string;}
const pending=new Map<string,Promise<TrialsResult>>();
export function loadTrials(drugId:string,filter:TrialFilter,force=false):Promise<TrialsResult>{
 const {key}=trialsRequest(drugId,filter);const previous=pending.get(key);if(previous)return previous;
 const job=read(drugId,filter,force).finally(()=>pending.delete(key));pending.set(key,job);return job;
}
async function read(drugId:string,filter:TrialFilter,force:boolean):Promise<TrialsResult>{
 const {key}=trialsRequest(drugId,filter);let cached:TrialsCache|undefined;
 try{const parsed=trialsCacheSchema.safeParse(await db.trialsCache.get(key));if(parsed.success&&parsed.data.key===key)cached=parsed.data;}catch{/* Réseau disponible même sans stockage. */}
 const offline=typeof navigator!=='undefined'&&!navigator.onLine;
 if(cached&&(offline||!force&&cached.expiresAt>Date.now()))return {entry:cached,stale:cached.expiresAt<=Date.now(),warning:offline?'Copie hors ligne : le statut actuel des études n’est pas garanti.':''};
 if(offline)throw new Error('Hors ligne : aucune recherche téléchargée pour cette substance et ce filtre.');
 try{
  const entry=trialsCacheSchema.parse(await fetchTrials(drugId,filter));if(entry.key!==key)throw new Error('ClinicalTrials.gov : identité du cache différente.');let warning='';
  try{await db.transaction('rw',db.trialsCache,async()=>{await db.trialsCache.put(entry);const old=await db.trialsCache.orderBy('retrievedAt').reverse().offset(30).primaryKeys();if(old.length)await db.trialsCache.bulkDelete(old);});}catch{warning='Lecture possible, sauvegarde hors ligne impossible.';}
  return {entry,stale:false,warning};
 }catch(e){if(cached)return {entry:cached,stale:true,warning:`${e instanceof Error?e.message:'Source indisponible.'} Copie ancienne conservée avec sa date ; statut actuel non garanti.`};throw e;}
}
