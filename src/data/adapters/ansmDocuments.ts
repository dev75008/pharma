import { z } from 'zod';
import { cacheExpiry, MedicamentsApiError, requestApiJson } from './medicamentsApi';

export const documentKindSchema=z.enum(['rcp','notice']);
export type DocumentKind=z.infer<typeof documentKindSchema>;
export const ansmDocumentSchema=z.object({
 cis:z.string().regex(/^\d{8}$/),type:documentKindSchema,titre:z.string().min(1).max(1000),
 miseAJour:z.iso.date().nullish(),source:z.literal('ANSM - Base de données publique des médicaments'),
 sections:z.array(z.object({id:z.string().regex(/^[a-z0-9.-]+$/).max(200),titre:z.string().min(1).max(1000),contenu:z.string().max(1000000)}).passthrough()).min(1).max(200),
}).passthrough().superRefine((doc,ctx)=>{
 if(new Set(doc.sections.map(s=>s.id)).size!==doc.sections.length)ctx.addIssue({code:'custom',message:'Identifiants de rubriques dupliqués'});
 if(doc.sections.reduce((n,s)=>n+s.contenu.length,0)>2500000)ctx.addIssue({code:'custom',message:'Document trop volumineux'});
});
export const documentCacheSchema=z.object({
 key:z.string(),schemaVersion:z.literal(1),document:ansmDocumentSchema,
 retrievedAt:z.iso.datetime(),expiresAt:z.number().finite().nonnegative(),
}).strict().refine(e=>e.key===`${e.document.cis}:${e.document.type}`,'Identité du cache document incohérente');
export type DocumentCacheEntry=z.infer<typeof documentCacheSchema>;
export function documentPath(cis:string,kind:DocumentKind) {
 if(!/^\d{8}$/.test(cis)||!documentKindSchema.safeParse(kind).success)throw new MedicamentsApiError('Document ou CIS invalide.','input');
 return `/v1/medicaments/${cis}/${kind}`;
}
export async function fetchDocument(cis:string,kind:DocumentKind,fetcher:typeof fetch=fetch):Promise<DocumentCacheEntry> {
 const path=documentPath(cis,kind);
 const {response,payload}=await requestApiJson(path,fetcher).catch(error=>{
  if(error instanceof MedicamentsApiError&&error.code==='not-found')throw new MedicamentsApiError('Ce RCP ou cette notice n’est pas disponible dans la copie de l’API.','not-found');
  throw error;
 });
 const parsed=ansmDocumentSchema.safeParse(payload);
 if(!parsed.success||parsed.data.cis!==cis||parsed.data.type!==kind)throw new MedicamentsApiError('Document ANSM incohérent : contenu non utilisé.','invalid-data');
 const now=Date.now();
 return {key:`${cis}:${kind}`,schemaVersion:1,document:parsed.data,retrievedAt:new Date(now).toISOString(),expiresAt:cacheExpiry(response,3600,now)};
}
