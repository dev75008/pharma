import {db} from './db';
import {bindingKey,chemblKnowledgeSchema,fetchMechanisms,fetchTarget,targetUrl,type ChemblKnowledge,type MechanismBinding} from '../data/adapters/chemblMechanisms';
export interface KnowledgeResult {entry:ChemblKnowledge;stale:boolean;warning:string;}
const pending=new Map<string,Promise<KnowledgeResult>>();
function load(key:string,request:()=>Promise<ChemblKnowledge>,force:boolean){const previous=pending.get(key);if(previous)return previous;const job=read(key,request,force).finally(()=>pending.delete(key));pending.set(key,job);return job;}
export function loadMechanisms(binding:MechanismBinding,force=false){return load(bindingKey(binding),()=>fetchMechanisms(binding),force);}
export function loadTarget(id:string,force=false){targetUrl(id);return load(`target:${id}`,()=>fetchTarget(id),force);}
async function read(key:string,request:()=>Promise<ChemblKnowledge>,force:boolean):Promise<KnowledgeResult>{let cached:ChemblKnowledge|undefined;try{const parsed=chemblKnowledgeSchema.safeParse(await db.chemblKnowledge.get(key));if(parsed.success&&parsed.data.key===key)cached=parsed.data;}catch{/* Le réseau reste utilisable sans cache. */}
 const offline=typeof navigator!=='undefined'&&!navigator.onLine;if(cached&&(offline||!force&&cached.expiresAt>Date.now()))return {entry:cached,stale:cached.expiresAt<=Date.now(),warning:offline?'Données ChEMBL téléchargées : lecture hors ligne.':''};if(offline)throw new Error('Hors ligne : ces mécanismes ou cette cible n’ont pas encore été téléchargés.');
 try{const entry=await request();if(entry.key!==key)throw new Error('Identité de réponse ChEMBL incohérente.');let warning='';try{await db.transaction('rw',db.chemblKnowledge,async()=>{await db.chemblKnowledge.put(entry);const old=await db.chemblKnowledge.orderBy('retrievedAt').reverse().offset(40).primaryKeys();if(old.length)await db.chemblKnowledge.bulkDelete(old);});}catch{warning='Lecture possible, sauvegarde hors ligne impossible.';}return {entry,stale:false,warning};}catch(error){if(cached)return {entry:cached,stale:true,warning:`${error instanceof Error?error.message:'ChEMBL indisponible.'} Ancienne copie datée conservée.`};throw error;}
}
