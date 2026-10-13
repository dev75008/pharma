import {z} from 'zod';
import {molecularText} from './molecular';
export function conformerUrl(cid:number){z.number().int().positive().max(1e10).parse(cid);return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`;}
export function parseConformer(sdf:string,cid:number){
 if(sdf.length>1000000||sdf.split('$$$$').length!==2||sdf.split('$$$$')[1].trim()!=='')throw new Error('PubChem 3D : un seul conformère SDF attendu.');
 const lines=sdf.replace(/\r/g,'').split('\n');const reported=sdf.match(/^>\s*<PUBCHEM_COMPOUND_CID>\s*\r?\n(\d+)/m);
 if(!reported||Number(reported[1])!==cid||Number(lines[0])!==cid)throw new Error('PubChem 3D : identité CID différente.');
 if(!lines[1]?.includes('3D')||!lines[3]?.includes('V2000'))throw new Error('PubChem 3D : coordonnées 3D V2000 attendues.');
 const atoms=Number(lines[3].slice(0,3));const bonds=Number(lines[3].slice(3,6));
 if(!Number.isInteger(atoms)||atoms<1||atoms>1000||!Number.isInteger(bonds)||bonds<0||bonds>2000)throw new Error('PubChem 3D : taille moléculaire invalide.');
 const rows=lines.slice(4,4+atoms);if(rows.length!==atoms||rows.some(line=>![0,10,20].every(start=>line.slice(start,start+10).trim()!==''&&Number.isFinite(Number(line.slice(start,start+10)))&&Math.abs(Number(line.slice(start,start+10)))<10000)||!/^\s*[A-Z][a-z]?\s*$/.test(line.slice(31,34))))throw new Error('PubChem 3D : atomes ou coordonnées invalides.');
 const bondRows=lines.slice(4+atoms,4+atoms+bonds);if(bondRows.length!==bonds||!bondRows.every(line=>{const a=Number(line.slice(0,3)),b=Number(line.slice(3,6)),order=Number(line.slice(6,9));return Number.isInteger(a)&&Number.isInteger(b)&&a>=1&&a<=atoms&&b>=1&&b<=atoms&&a!==b&&Number.isInteger(order)&&order>=1&&order<=4;})||!lines.includes('M  END'))throw new Error('PubChem 3D : liaisons invalides.');
 return {atoms,bonds};
}
export const conformerSchema=z.object({key:z.string(),cid:z.number().int().positive(),url:z.string().url(),sourceId:z.literal('pubchem'),sdf:z.string().max(1000000),retrievedAt:z.iso.datetime(),expiresAt:z.number().finite().nonnegative(),sourceUpdatedAt:z.null()}).strict().superRefine((v,ctx)=>{try{if(v.key!==`sdf:${v.cid}`||v.url!==conformerUrl(v.cid))throw new Error();parseConformer(v.sdf,v.cid);}catch{ctx.addIssue({code:'custom',message:'Identité ou structure SDF invalide'});}});
export type Conformer=z.infer<typeof conformerSchema>;
export async function fetchConformer(cid:number){const sdf=await molecularText('pubchem',conformerUrl(cid));parseConformer(sdf,cid);return conformerSchema.parse({key:`sdf:${cid}`,cid,url:conformerUrl(cid),sourceId:'pubchem',sdf,retrievedAt:new Date().toISOString(),expiresAt:Date.now()+86400000,sourceUpdatedAt:null});}
