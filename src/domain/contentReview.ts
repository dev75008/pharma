import {z} from 'zod';
const kind=z.enum(['drug','question','flashcard','case']);
const hash=z.string().regex(/^[a-f0-9]{64}$/);
export interface ReviewEntry {kind:z.infer<typeof kind>;id:string;content:unknown;}
export interface ReviewPacket {schemaVersion:1;generatedAt:string;contentVersion:string;packetHash:string;items:(ReviewEntry&{contentHash:string})[];}
const packetSchema=z.object({schemaVersion:z.literal(1),generatedAt:z.iso.datetime(),contentVersion:z.string().min(1),packetHash:hash,items:z.array(z.object({kind,id:z.string().min(1).max(150),content:z.unknown(),contentHash:hash}).strict()).min(1).max(20000)}).passthrough();
// Clés triées récursivement, ordre des listes conservé : indépendant du format JSON du fichier.
export function canonicalJson(value:unknown):string{
 if(value===null||typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(canonicalJson).join(',')+']';
 if(typeof value==='object'&&value!==null)return '{'+Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>JSON.stringify(k)+':'+canonicalJson(v)).join(',')+'}';
 throw Error('Valeur non sérialisable dans le dossier de relecture.');
}
async function digest(value:unknown,cryptoApi:Crypto){if(!cryptoApi?.subtle)throw Error('Empreinte indisponible : utiliser HTTPS ou le script local.');const bytes=await cryptoApi.subtle.digest('SHA-256',new TextEncoder().encode(canonicalJson(value)));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
export async function createReviewPacket(entries:ReviewEntry[],contentVersion:string,cryptoApi:Crypto=globalThis.crypto):Promise<ReviewPacket>{
 const keys=entries.map(e=>e.kind+':'+e.id);if(new Set(keys).size!==keys.length)throw Error('Élément de relecture dupliqué.');
 const items=[];for(const entry of entries){kind.parse(entry.kind);if(!entry.id)throw Error('Identifiant absent.');items.push({...entry,contentHash:await digest(entry.content,cryptoApi)});}
 const packetHash=await digest({contentVersion,items:items.map(({kind,id,contentHash})=>({kind,id,contentHash}))},cryptoApi);
 return {schemaVersion:1,generatedAt:new Date().toISOString(),contentVersion,packetHash,items};
}
export async function verifyReviewPacket(raw:unknown,cryptoApi:Crypto=globalThis.crypto):Promise<ReviewPacket>{const parsed=packetSchema.parse(raw);const rebuilt=await createReviewPacket(parsed.items.map(({kind,id,content})=>({kind,id,content})),parsed.contentVersion,cryptoApi);if(parsed.packetHash!==rebuilt.packetHash||parsed.items.some((item,i)=>item.contentHash!==rebuilt.items[i].contentHash))throw Error('Dossier altéré : empreintes incohérentes.');return parsed;}
export const reviewReportSchema=z.object({schemaVersion:z.literal(1),packetHash:hash,reviewedAt:z.iso.date(),reviewer:z.object({name:z.string().trim().min(2).max(200),qualification:z.string().trim().min(3).max(500),affiliation:z.string().trim().min(2).max(500),independenceDeclared:z.literal(true)}).strict(),decisions:z.array(z.object({kind,id:z.string().min(1).max(150),contentHash:hash,decision:z.enum(['accepted','changes-requested','rejected']),comment:z.string().trim().min(10).max(20000)}).strict()).min(1).max(20000)}).strict();
export function checkReviewReport(raw:unknown,packet:ReviewPacket,today=new Date().toISOString().slice(0,10)){
 const report=reviewReportSchema.parse(raw);if(report.packetHash!==packet.packetHash)throw Error('Le contenu a changé : dossier de relecture incompatible.');
 if(report.reviewedAt>today||report.reviewedAt<packet.generatedAt.slice(0,10))throw Error('Date de relecture incompatible avec le dossier.');
 const seen=new Set<string>();for(const decision of report.decisions){const key=decision.kind+':'+decision.id;if(seen.has(key))throw Error('Décision dupliquée.');seen.add(key);const item=packet.items.find(i=>i.kind===decision.kind&&i.id===decision.id);if(!item||item.contentHash!==decision.contentHash)throw Error('Décision pour un contenu inconnu ou modifié.');}
 return {report,accepted:report.decisions.filter(d=>d.decision==='accepted').length,changesRequested:report.decisions.filter(d=>d.decision==='changes-requested').length,rejected:report.decisions.filter(d=>d.decision==='rejected').length,unreviewed:packet.items.length-seen.size};
}
// Une déclaration compatible n'authentifie ni identité, qualification, ni indépendance.
// Ce module ne modifie aucun statut scientifique ni donnée personnelle.
