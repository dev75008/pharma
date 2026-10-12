import { z } from 'zod';

// Noms documentaires anglais explicites ; une recherche n'est pas une correspondance d'identifiants.
export const literatureTerms:Record<string,string> = {bisoprolol:'bisoprolol',ramipril:'ramipril',losartan:'losartan',furosemide:'furosemide',rivaroxaban:'rivaroxaban',clopidogrel:'clopidogrel',amoxicilline:'amoxicillin',metformine:'metformin',paracetamol:'acetaminophen',ibuprofene:'ibuprofen',prednisolone:'prednisolone',sertraline:'sertraline',levetiracetam:'levetiracetam'};
const text=z.string().max(10000);
export const citationSchema=z.object({id:z.string().regex(/^\d+$/),source:z.literal('MED'),title:text,authorString:text.optional(),journalTitle:text.optional(),pubYear:z.string().regex(/^\d{4}$/).optional(),doi:text.optional(),isOpenAccess:z.enum(['Y','N']).optional()});
const responseSchema=z.object({hitCount:z.number().int().nonnegative(),request:z.object({queryString:text}),resultList:z.object({result:z.array(citationSchema).max(10)})});
export function literatureRequest(drugId:string){
 const term=literatureTerms[drugId];if(!term)throw new Error('Molécule non prise en charge.');
 const query=`TITLE_ABS:"${term}" AND SRC:MED`;
 const url=new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
 url.search=new URLSearchParams({query,format:'json',pageSize:'10',resultType:'lite'}).toString();
 return {query,url:url.href};
}
export const literatureCacheSchema=z.object({key:z.string(),schemaVersion:z.literal(1),sourceId:z.literal('europepmc'),url:z.string().url(),query:text,hitCount:z.number().int().nonnegative(),citations:z.array(citationSchema).max(10),retrievedAt:z.iso.datetime(),sourceUpdatedAt:z.null(),expiresAt:z.number().finite().nonnegative()}).strict().superRefine((entry,ctx)=>{
 try{const request=literatureRequest(entry.key);if(request.url!==entry.url||request.query!==entry.query)ctx.addIssue({code:'custom',message:'Provenance incohérente'});}catch{ctx.addIssue({code:'custom',message:'Identifiant inconnu'});}
 if(new Set(entry.citations.map(c=>c.id)).size!==entry.citations.length)ctx.addIssue({code:'custom',message:'Citations dupliquées'});
});
export type LiteratureCache=z.infer<typeof literatureCacheSchema>;
let nextRequestAt=0;
export async function fetchLiterature(drugId:string,fetcher:typeof fetch=fetch):Promise<LiteratureCache>{
 const {query,url}=literatureRequest(drugId);const now=Date.now();
 if(now<nextRequestAt)throw new Error('Europe PMC : attendez quelques secondes avant une nouvelle requête.');
 nextRequestAt=now+1000;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
 try{
  const response=await fetcher(url,{signal:controller.signal,credentials:'omit',headers:{Accept:'application/json'}});
  if(response.status===429){nextRequestAt=Date.now()+60000;throw new Error('Europe PMC : limite de requêtes atteinte. Réessayez dans une minute.');}
  if(!response.ok)throw new Error(`Europe PMC indisponible (HTTP ${response.status}).`);
  const parsed=responseSchema.safeParse(await response.json());
  if(!parsed.success||parsed.data.request.queryString!==query)throw new Error('Réponse Europe PMC invalide ou recherche différente.');
  return literatureCacheSchema.parse({key:drugId,schemaVersion:1,sourceId:'europepmc',url,query,hitCount:parsed.data.hitCount,citations:parsed.data.resultList.result,retrievedAt:new Date().toISOString(),sourceUpdatedAt:null,expiresAt:Date.now()+86400000});
 }catch(error){if(error instanceof Error&&(error.message.startsWith('Europe PMC')||error.message.startsWith('Réponse')))throw error;throw new Error(controller.signal.aborted?'Europe PMC : délai de réponse dépassé.':'Europe PMC : réseau indisponible ou données invalides.');}
 finally{clearTimeout(timer);}
}
