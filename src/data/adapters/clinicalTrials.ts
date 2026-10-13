import {z} from 'zod';
import {literatureTerms} from './europePmc';

export const trialFilterSchema=z.enum(['all','RECRUITING','COMPLETED']);
export type TrialFilter=z.infer<typeof trialFilterSchema>;
export const trialFilters:Record<TrialFilter,string>={all:'Tous les statuts',RECRUITING:'Recrutement en cours',COMPLETED:'Études terminées'};
export const trialsVersionUrl='https://clinicaltrials.gov/api/v2/version';
const text=z.string().min(1).max(10000);
export const trialsVersionSchema=z.object({apiVersion:z.string().min(1).max(100),dataTimestamp:z.iso.datetime({local:true,offset:true})});
export const trialSchema=z.object({
 protocolSection:z.object({
  identificationModule:z.object({nctId:z.string().regex(/^NCT\d{8}$/),briefTitle:text}),
  statusModule:z.object({overallStatus:z.string().min(1).max(100).optional(),lastUpdatePostDateStruct:z.object({date:z.iso.date()}).optional()}).optional(),
  designModule:z.object({studyType:z.enum(['INTERVENTIONAL','OBSERVATIONAL','EXPANDED_ACCESS']).optional(),phases:z.array(z.enum(['NA','EARLY_PHASE1','PHASE1','PHASE2','PHASE3','PHASE4'])).max(6).optional()}).optional(),
 }),
 hasResults:z.boolean().optional(),
});
const responseSchema=z.object({totalCount:z.number().int().nonnegative(),studies:z.array(trialSchema).max(10),nextPageToken:z.string().min(1).max(2000).optional()});
export function trialsRequest(drugId:string,filter:TrialFilter){
 trialFilterSchema.parse(filter);const term=literatureTerms[drugId];if(typeof term!=='string')throw new Error('Substance non prise en charge.');
 const params=new URLSearchParams({'query.intr':term,format:'json',pageSize:'10',countTotal:'true',sort:'LastUpdatePostDate:desc',fields:'NCTId,BriefTitle,OverallStatus,StudyType,Phase,HasResults,LastUpdatePostDate'});
 if(filter!=='all')params.set('filter.overallStatus',filter);
 return {key:`${drugId}:${filter}`,drugId,filter,term,url:`https://clinicaltrials.gov/api/v2/studies?${params}`};
}
function validatePage(studies:z.infer<typeof trialSchema>[],totalCount:number,hasMore:boolean,filter:TrialFilter){
 const ids=studies.map(s=>s.protocolSection.identificationModule.nctId);
 if(new Set(ids).size!==ids.length)throw new Error('ClinicalTrials.gov : identifiants dupliqués.');
 if(totalCount<studies.length||hasMore!==(totalCount>studies.length))throw new Error('ClinicalTrials.gov : pagination incohérente.');
 if(filter!=='all'&&studies.some(s=>s.protocolSection.statusModule?.overallStatus!==filter))throw new Error('ClinicalTrials.gov : statut différent du filtre demandé.');
}
export function parseTrials(raw:unknown,filter:TrialFilter){trialFilterSchema.parse(filter);const parsed=responseSchema.parse(raw);const hasMore=!!parsed.nextPageToken;validatePage(parsed.studies,parsed.totalCount,hasMore,filter);return {studies:parsed.studies,totalCount:parsed.totalCount,hasMore};}
export const trialsCacheSchema=z.object({
 key:z.string(),drugId:z.string(),filter:trialFilterSchema,term:z.string(),url:z.string().url(),
 sourceId:z.literal('clinicaltrials'),schemaVersion:z.literal(1),versionUrl:z.literal(trialsVersionUrl),version:trialsVersionSchema,
 studies:z.array(trialSchema).max(10),totalCount:z.number().int().nonnegative(),hasMore:z.boolean(),
 retrievedAt:z.iso.datetime(),expiresAt:z.number().finite().nonnegative(),
}).strict().superRefine((entry,ctx)=>{try{const request=trialsRequest(entry.drugId,entry.filter);if(request.key!==entry.key||request.url!==entry.url||request.term!==entry.term)throw new Error();validatePage(entry.studies,entry.totalCount,entry.hasMore,entry.filter);}catch{ctx.addIssue({code:'custom',message:'Recherche ou provenance ClinicalTrials.gov incohérente'});}});
export type TrialsCache=z.infer<typeof trialsCacheSchema>;

let tail:Promise<void>=Promise.resolve();let nextAt=0;let blockedUntil=0;
function json(url:string,fetcher:typeof fetch):Promise<unknown>{
 const job=tail.then(async()=>{
  if(Date.now()<blockedUntil)throw new Error('ClinicalTrials.gov : service temporairement limité.');
  const wait=nextAt-Date.now();if(wait>0)await new Promise(resolve=>setTimeout(resolve,wait));nextAt=Date.now()+1000;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
  try{
   const response=await fetcher(url,{signal:controller.signal,credentials:'omit',cache:'no-store',headers:{Accept:'application/json'}});
   if(response.status===429||response.status===503){const retry=response.headers.get('Retry-After');const numeric=Number(retry);const seconds=Number.isFinite(numeric)&&numeric>0?numeric:retry?Math.max(0,(Date.parse(retry)-Date.now())/1000):60;blockedUntil=Date.now()+(Number.isFinite(seconds)&&seconds>0?Math.min(seconds,300):60)*1000;throw new Error(`ClinicalTrials.gov : HTTP ${response.status}. Aucune nouvelle tentative automatique.`);}
   if(!response.ok)throw new Error(`ClinicalTrials.gov : HTTP ${response.status}.`);
   return await response.json();
  }catch(e){if(e instanceof Error&&e.message.startsWith('ClinicalTrials.gov'))throw e;throw new Error(controller.signal.aborted?'ClinicalTrials.gov : délai dépassé.':'ClinicalTrials.gov : réseau indisponible ou réponse invalide.');}
  finally{clearTimeout(timer);}
 });tail=job.then(()=>undefined,()=>undefined);return job;
}
export async function fetchTrials(drugId:string,filter:TrialFilter,fetcher:typeof fetch=fetch):Promise<TrialsCache>{
 const request=trialsRequest(drugId,filter);
 try{
  const version=trialsVersionSchema.parse(await json(trialsVersionUrl,fetcher));
  const page=parseTrials(await json(request.url,fetcher),filter);
  return trialsCacheSchema.parse({...request,...page,version,versionUrl:trialsVersionUrl,sourceId:'clinicaltrials',schemaVersion:1,retrievedAt:new Date().toISOString(),expiresAt:Date.now()+3600000});
 }catch(e){if(e instanceof z.ZodError)throw new Error('ClinicalTrials.gov : réponse invalide ou date de traitement indisponible.');throw e;}
}
