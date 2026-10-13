import {z} from 'zod';
import {drugs} from '../drugs';
const inchi=z.string().regex(/^[A-Z]{14}-[A-Z]{10}-[A-Z]$/);
const chemblId=z.string().regex(/^CHEMBL\d+$/);
export function drugCid(drugId:string){const field=drugs.find(d=>d.id===drugId)?.fields.pubchem;const match=field?.status==='available'?/^https:\/\/pubchem\.ncbi\.nlm\.nih\.gov\/compound\/(\d+)$/.exec(field.value):null;if(!match)throw new Error('CID PubChem non documenté pour cette molécule.');return Number(match[1]);}
export const pubchemPropertySchema=z.object({CID:z.number().int().positive(),MolecularFormula:z.string().min(1).max(200),MolecularWeight:z.string().regex(/^\d+(\.\d+)?$/),InChIKey:inchi,SMILES:z.string().min(1).max(20000),XLogP:z.number().finite().optional(),TPSA:z.number().finite().nonnegative().optional()});
const pubchemResponseSchema=z.object({PropertyTable:z.object({Properties:z.array(pubchemPropertySchema).length(1)})});
export const chemblMoleculeSchema=z.object({molecule_chembl_id:chemblId,pref_name:z.string().max(300).nullable(),molecule_structures:z.object({standard_inchi_key:inchi}),molecule_hierarchy:z.object({parent_chembl_id:chemblId.nullable()}).nullable()});
const chemblResponseSchema=z.object({molecules:z.array(chemblMoleculeSchema).max(5),page_meta:z.object({total_count:z.number().int().nonnegative(),next:z.string().nullable()})});
export function pubchemUrl(cid:number){z.number().int().positive().max(1e10).parse(cid);return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,InChIKey,SMILES,XLogP,TPSA/JSON`;}
export function chemblUrl(key:string){inchi.parse(key);const url=new URL('https://www.ebi.ac.uk/chembl/api/data/molecule.json');url.search=new URLSearchParams({molecule_structures__standard_inchi_key:key,limit:'5'}).toString();return url.href;}
export function parsePubchem(raw:unknown,cid:number){const result=pubchemResponseSchema.parse(raw).PropertyTable.Properties[0];if(result.CID!==cid)throw new Error('PubChem a retourné une autre identité moléculaire.');return result;}
export function parseChembl(raw:unknown,key:string){inchi.parse(key);const parsed=chemblResponseSchema.parse(raw);if(parsed.page_meta.next||parsed.page_meta.total_count>1||parsed.molecules.length>1)throw new Error('Plusieurs correspondances ChEMBL : aucune sélection automatique.');if(parsed.page_meta.total_count!==parsed.molecules.length)throw new Error('Réponse ChEMBL incomplète.');const result=parsed.molecules[0]??null;if(result&&result.molecule_structures.standard_inchi_key!==key)throw new Error('InChIKey ChEMBL différent : correspondance refusée.');return result;}
const common={schemaVersion:z.literal(1),retrievedAt:z.iso.datetime(),expiresAt:z.number().finite().nonnegative(),sourceUpdatedAt:z.null()};
export const molecularCacheSchema=z.discriminatedUnion('sourceId',[
 z.object({...common,key:z.string(),sourceId:z.literal('pubchem'),url:z.string().url(),properties:pubchemPropertySchema}).strict(),
 z.object({...common,key:z.string(),sourceId:z.literal('chembl'),url:z.string().url(),inchiKey:inchi,molecule:chemblMoleculeSchema.nullable()}).strict(),
]).superRefine((entry,ctx)=>{const fail=()=>ctx.addIssue({code:'custom',message:'Provenance ou identité incohérente'});if(entry.sourceId==='pubchem'){if(entry.key!==`pubchem:${entry.properties.CID}`||entry.url!==pubchemUrl(entry.properties.CID))fail();}else if(entry.key!==`chembl:${entry.inchiKey}`||entry.url!==chemblUrl(entry.inchiKey)||(entry.molecule&&entry.molecule.molecule_structures.standard_inchi_key!==entry.inchiKey))fail();});
export type MolecularCache=z.infer<typeof molecularCacheSchema>;
type Provider=MolecularCache['sourceId'];
const lanes:Record<Provider,{tail:Promise<void>;nextAt:number;blockedUntil:number}>={pubchem:{tail:Promise.resolve(),nextAt:0,blockedUntil:0},chembl:{tail:Promise.resolve(),nextAt:0,blockedUntil:0}};
export function molecularJson(provider:Provider,url:string,fetcher:typeof fetch=fetch):Promise<unknown>{
 const lane=lanes[provider];const run=async()=>{
  if(Date.now()<lane.blockedUntil)throw new Error(`${provider} : service temporairement limité. Réessayez plus tard.`);
  const wait=lane.nextAt-Date.now();if(wait>0)await new Promise(resolve=>setTimeout(resolve,wait));lane.nextAt=Date.now()+1000;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
  try{const response=await fetcher(url,{signal:controller.signal,credentials:'omit',cache:'no-store',headers:{Accept:'application/json'}});
   if(response.status===429||response.status===503){const retry=response.headers.get('Retry-After');const seconds=retry&&/^\d+$/.test(retry)?Number(retry):retry?Math.max(0,(Date.parse(retry)-Date.now())/1000):30;lane.blockedUntil=Date.now()+Math.min(300,Number.isFinite(seconds)?Math.max(1,seconds):30)*1000;throw new Error(`${provider} : service occupé ou limite atteinte (HTTP ${response.status}). Aucune nouvelle tentative automatique.`);}
   if(!response.ok)throw new Error(`${provider} indisponible (HTTP ${response.status}).`);
   return await response.json();
  }catch(error){if(error instanceof Error&&error.message.startsWith(provider))throw error;throw new Error(controller.signal.aborted?`${provider} : délai de réponse dépassé.`:`${provider} : réseau indisponible ou réponse JSON invalide.`);}finally{clearTimeout(timer);}
 };
 const job=lane.tail.then(run,run);lane.tail=job.then(()=>undefined,()=>undefined);return job;
}
export async function fetchPubchem(cid:number,fetcher:typeof fetch=fetch):Promise<MolecularCache>{const url=pubchemUrl(cid);const raw=await molecularJson('pubchem',url,fetcher);let properties;try{properties=parsePubchem(raw,cid);}catch(e){if(e instanceof z.ZodError)throw new Error('PubChem : propriétés invalides ou incomplètes.');throw e;}return molecularCacheSchema.parse({key:`pubchem:${cid}`,sourceId:'pubchem',url,properties,schemaVersion:1,retrievedAt:new Date().toISOString(),expiresAt:Date.now()+86400000,sourceUpdatedAt:null});}
export async function fetchChembl(key:string,fetcher:typeof fetch=fetch):Promise<MolecularCache>{const url=chemblUrl(key);const raw=await molecularJson('chembl',url,fetcher);let molecule;try{molecule=parseChembl(raw,key);}catch(e){if(e instanceof z.ZodError)throw new Error('ChEMBL : réponse invalide ou incomplète.');throw e;}return molecularCacheSchema.parse({key:`chembl:${key}`,sourceId:'chembl',url,inchiKey:key,molecule,schemaVersion:1,retrievedAt:new Date().toISOString(),expiresAt:Date.now()+86400000,sourceUpdatedAt:null});}
