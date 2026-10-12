import { z } from 'zod';

export const MEDICAMENTS_API = 'https://medicaments-api.giygas.dev';
const text = z.string().max(20000);
const cis = z.number().int().min(10000000).max(99999999);
const optionalText = text.nullish();
export const compositionSchema = z.object({
 cis, elementPharmaceutique: optionalText, codeSubstance: z.number().int().nullish(),
 denominationSubstance: text.min(1), dosage: optionalText, referenceDosage: optionalText, natureComposant: optionalText,
}).passthrough();
export const presentationSchema = z.object({
 cis, cip7: z.number().int().positive().nullish(), cip13: z.number().int().positive().nullish(),
 libelle: text.min(1), statusAdministratif: optionalText, etatComercialisation: optionalText,
 dateDeclaration: optionalText, agreement: optionalText, tauxRemboursement: optionalText,
 prix: z.number().finite().nonnegative().nullish(), prixPublic: z.number().finite().nonnegative().nullish(),
 honorairesDispensation: z.number().finite().nonnegative().nullish(),
}).passthrough();
export const regulatoryDrugSchema = z.object({
 cis, elementPharmaceutique: text.min(1), formePharmaceutique: optionalText,
 voiesAdministration: z.array(text).max(50).nullish(), statusAutorisation: optionalText,
 typeProcedure: optionalText, etatComercialisation: optionalText, dateAMM: optionalText,
 titulaire: optionalText, surveillanceRenforcee: optionalText,
 composition: z.array(compositionSchema).max(200).nullish(),
 presentation: z.array(presentationSchema).max(500).nullish(), conditions: z.array(text).max(200).nullish(),
 generiques: z.array(z.object({cis, group:z.number().int().positive(),libelle:text,type:optionalText}).passthrough()).max(100).nullish(),
}).passthrough().superRefine((record,ctx)=>{
 for(const field of ['composition','presentation','generiques'] as const) {
  record[field]?.forEach((item,index)=>{if(item.cis!==record.cis)ctx.addIssue({code:'custom',path:[field,index,'cis'],message:'CIS imbriqué incohérent'});});
 }
});
export type RegulatoryDrug = z.infer<typeof regulatoryDrugSchema>;
export const apiCacheSchema = z.object({
 key:z.string().startsWith('/v1/medicaments'), schemaVersion:z.literal(1),
 records:z.array(regulatoryDrugSchema).max(250), retrievedAt:z.iso.datetime(),
 sourceSyncedAt:z.iso.datetime().nullable(), expiresAt:z.number().finite().nonnegative(),
}).strict();
export type ApiCacheEntry = z.infer<typeof apiCacheSchema>;
export type CatalogRequest = { key:string; kind:'search'|'cis'|'cip'; term:string };
export class MedicamentsApiError extends Error {
 constructor(message:string, public code:'input'|'network'|'timeout'|'rate-limit'|'not-found'|'invalid-data'|'server', public retryAt:number|null=null) {super(message);}
}
export function catalogRequest(input:string):CatalogRequest {
 const term=input.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/œ/gi,'oe').trim().replace(/\s+/g,' ').toLowerCase();
 if (/^\d{8}$/.test(term)) return {key:`/v1/medicaments/${term}`,kind:'cis',term};
 if (/^(\d{7}|\d{13})$/.test(term)) return {key:`/v1/medicaments?cip=${term}`,kind:'cip',term};
 if(term.length<3||term.length>50||term.split(/[ +]+/).length>6||!/[a-z0-9]/.test(term)||!/^[a-z0-9 .+\-]+$/.test(term))
  throw new MedicamentsApiError('Saisissez un nom de 3 à 50 caractères (six mots maximum), un CIS de huit chiffres ou un CIP de sept ou treize chiffres.','input');
 return {key:`/v1/medicaments?${new URLSearchParams({search:term})}`,kind:'search',term};
}
export function parseCatalogResponse(value:unknown,request:CatalogRequest):RegulatoryDrug[] {
 const records=request.kind==='search'?z.array(regulatoryDrugSchema).max(250).parse(value):[regulatoryDrugSchema.parse(value)];
 if(new Set(records.map(r=>r.cis)).size!==records.length)throw new Error('CIS dupliqués');
 if(request.kind==='cis'&&records[0].cis!==Number(request.term))throw new Error('CIS différent de celui demandé');
 if(request.kind==='cip'&&!records[0].presentation?.some(p=>String(p.cip7)===request.term||String(p.cip13)===request.term))throw new Error('CIP différent de celui demandé');
 return records;
}
let blockedUntil=0;
export function retryTime(value:string|null,now:number) {
 if(value&&/^\d+$/.test(value))return now+Math.max(1,Number(value))*1000;
 const parsed=value?Date.parse(value):NaN;
 return Number.isFinite(parsed)&&parsed>now?parsed:now+30000;
}
export async function fetchCatalog(request:CatalogRequest,fetcher:typeof fetch=fetch,now=Date.now()):Promise<ApiCacheEntry> {
 if(now<blockedUntil)throw new MedicamentsApiError('Limite de requêtes atteinte. Réessayez après le délai indiqué.','rate-limit',blockedUntil);
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
 try {
  const response=await fetcher(MEDICAMENTS_API+request.key,{signal:controller.signal,credentials:'omit',cache:'no-store',headers:{Accept:'application/json'}});
  if(response.status===429){blockedUntil=retryTime(response.headers.get('Retry-After'),Date.now());throw new MedicamentsApiError('L’API limite temporairement les requêtes. Aucun nouvel essai automatique.','rate-limit',blockedUntil);}
  if(response.status===404)throw new MedicamentsApiError('Aucune spécialité trouvée dans cet instantané de l’API.','not-found');
  if(!response.ok)throw new MedicamentsApiError(`API indisponible (HTTP ${response.status}).`,'server');
  if(!response.headers.get('Content-Type')?.includes('application/json'))throw new MedicamentsApiError('La réponse de l’API n’est pas un document JSON.','invalid-data');
  let records:RegulatoryDrug[];
  try {records=parseCatalogResponse(await response.json(),request);}catch{throw new MedicamentsApiError('Réponse de l’API incompatible ou incohérente : aucune donnée nouvelle utilisée.','invalid-data');}
  const retrieved=Date.now();const lastModified=response.headers.get('Last-Modified');const parsed=lastModified?Date.parse(lastModified):NaN;
  const declared=/max-age=(\d+)/i.exec(response.headers.get('Cache-Control')??'');
  const age=Math.max(0,Number(response.headers.get('Age')??0)||0);
  const maxSeconds=request.kind==='search'?3600:14400;
  const seconds=declared?Math.max(0,Math.min(maxSeconds,Number(declared[1]))-age):maxSeconds;
  return {key:request.key,schemaVersion:1,records,retrievedAt:new Date(retrieved).toISOString(),sourceSyncedAt:Number.isFinite(parsed)?new Date(parsed).toISOString():null,expiresAt:retrieved+seconds*1000};
 } catch(error) {
  if(error instanceof MedicamentsApiError)throw error;
  if(controller.signal.aborted)throw new MedicamentsApiError('Délai réseau dépassé (10 secondes).','timeout');
  throw new MedicamentsApiError('Connexion à l’API impossible.','network');
 } finally {clearTimeout(timeout);}
}
