import {db} from './db';
import {chemblUrl,fetchChembl,fetchPubchem,molecularCacheSchema,pubchemUrl,type MolecularCache} from '../data/adapters/molecular';
export interface MolecularResult {entry:MolecularCache;stale:boolean;warning:string;}
const pending=new Map<string,Promise<MolecularResult>>();
export function loadMolecular(source:'pubchem'|'chembl',identity:number|string,force=false):Promise<MolecularResult>{
 let request:()=>Promise<MolecularCache>;let key:string;
 if(source==='pubchem'){if(typeof identity!=='number')throw new Error('CID numérique attendu.');pubchemUrl(identity);key=`pubchem:${identity}`;request=()=>fetchPubchem(identity);}else{if(typeof identity!=='string')throw new Error('InChIKey attendu.');chemblUrl(identity);key=`chembl:${identity}`;request=()=>fetchChembl(identity);}
 const previous=pending.get(key);if(previous)return previous;const job=read(key,request,force).finally(()=>pending.delete(key));pending.set(key,job);return job;
}
async function read(key:string,request:()=>Promise<MolecularCache>,force:boolean):Promise<MolecularResult>{
 let cached:MolecularCache|undefined;try{const parsed=molecularCacheSchema.safeParse(await db.molecularCache.get(key));if(parsed.success&&parsed.data.key===key)cached=parsed.data;}catch{/* Le réseau reste disponible sans stockage. */}
 const offline=typeof navigator!=='undefined'&&!navigator.onLine;if(cached&&(offline||!force&&cached.expiresAt>Date.now()))return {entry:cached,stale:cached.expiresAt<=Date.now(),warning:offline?'Données moléculaires téléchargées : lecture hors ligne.':''};
 if(offline)throw new Error('Hors ligne : ces données moléculaires n’ont pas encore été téléchargées.');
 try{const entry=await request();if(entry.key!==key)throw new Error('Identité du cache différente.');let warning='';try{await db.transaction('rw',db.molecularCache,async()=>{await db.molecularCache.put(entry);const old=await db.molecularCache.orderBy('retrievedAt').reverse().offset(40).primaryKeys();if(old.length)await db.molecularCache.bulkDelete(old);});}catch{warning='Lecture possible, mais sauvegarde hors ligne impossible.';}return {entry,stale:false,warning};}
 catch(error){if(cached)return {entry:cached,stale:true,warning:`${error instanceof Error?error.message:'Source indisponible.'} Ancienne copie conservée avec sa date.`};throw error;}
}
