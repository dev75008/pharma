import {z} from 'zod';
import manifest from './bundled-conformers.json';
import {conformerUrl,conformerSchema,parseConformer,type Conformer} from './adapters/conformer';
const metadata=z.object({drugId:z.string().regex(/^[a-z0-9-]+$/),cid:z.number().int().positive(),url:z.url(),retrievedAt:z.iso.datetime(),assetPath:z.string().regex(/^conformers\/[a-z0-9-]+\.txt$/),sha256:z.string().regex(/^[a-f0-9]{64}$/),atoms:z.number().int().positive(),bonds:z.number().int().nonnegative()}).strict().superRefine((m,ctx)=>{if(m.url!==conformerUrl(m.cid)||m.assetPath!==`conformers/${m.drugId}.txt`)ctx.addIssue({code:'custom',message:'Identité du conformère inclus incohérente.'});});
export const bundledManifestSchema=z.object({schemaVersion:z.literal(1),license:z.string().min(1),items:z.array(metadata).max(10000)}).strict().superRefine((m,ctx)=>{if(new Set(m.items.map(i=>i.cid)).size!==m.items.length||new Set(m.items.map(i=>i.drugId)).size!==m.items.length)ctx.addIssue({code:'custom',message:'Conformère inclus dupliqué.'});});
export const bundledConformers=bundledManifestSchema.parse(manifest);
export function bundledConformerMetadata(cid:number){return bundledConformers.items.find(i=>i.cid===cid);}
export async function verifyBundledConformer(cid:number,text:string,cryptoApi:Crypto=globalThis.crypto):Promise<Conformer>{
 const item=bundledConformerMetadata(cid);if(!item)throw Error('Aucun conformère inclus pour ce CID.');const sdf=text.replace(/\r\n?/g,'\n');const parsed=parseConformer(sdf,cid);
 if(!cryptoApi?.subtle)throw Error('Vérification d’intégrité indisponible. Utiliser HTTPS ou localhost.');const bytes=await cryptoApi.subtle.digest('SHA-256',new TextEncoder().encode(sdf));const hash=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==item.sha256||parsed.atoms!==item.atoms||parsed.bonds!==item.bonds)throw Error('Copie 3D incluse altérée ou incompatible.');
 return conformerSchema.parse({key:`sdf:${cid}`,cid,url:item.url,sourceId:'pubchem',sdf,retrievedAt:item.retrievedAt,expiresAt:Date.parse(item.retrievedAt)+86400000,sourceUpdatedAt:null});
}
export async function loadBundledConformer(cid:number){const item=bundledConformerMetadata(cid);if(!item)throw Error('Aucun conformère inclus pour ce CID.');const response=await fetch(import.meta.env.BASE_URL+item.assetPath,{credentials:'omit',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Copie 3D incluse indisponible : HTTP '+response.status);return verifyBundledConformer(cid,await response.text());}
