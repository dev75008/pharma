import {z} from 'zod';
import {drugSchema} from './validation';
import {questionSchema} from './assessment';
import {clinicalCaseSchema} from './clinicalCases';
import {flashcardSchema} from './spacedRepetition';
const id=z.string().regex(/^[a-z0-9-]+$/).max(150);
export const contentPackSchema=z.object({schemaVersion:z.literal(1),id,title:z.string().min(1).max(200),version:z.string().min(1).max(100),rights:z.string().min(20).max(5000),sources:z.array(z.object({id,name:z.string().min(1),url:z.url().refine(v=>v.startsWith('https://')),domain:z.string().min(1),accessPolicy:z.string().min(1),integrationStatus:z.enum(['link-only','manual-summary'])}).strict()).max(100),classes:z.array(z.object({id,label:z.string().min(1),parentId:id.optional(),specialtyIds:z.array(id).min(1),systemIds:z.array(id).min(1)}).strict()).max(300),drugs:z.array(drugSchema).max(1000),questions:z.array(questionSchema).max(10000),cases:z.array(clinicalCaseSchema).max(500),flashcards:z.array(flashcardSchema).max(10000),specialties:z.record(id,z.string().min(1)),systems:z.record(id,z.string().min(1))}).strict().superRefine((p,ctx)=>{
 const fail=(message:string)=>ctx.addIssue({code:'custom',message});
 for(const [name,rows] of [['sources',p.sources],['classes',p.classes],['drugs',p.drugs],['questions',p.questions],['cases',p.cases],['flashcards',p.flashcards]] as const)if(new Set(rows.map(r=>r.id)).size!==rows.length)fail(`Identifiants dupliqués : ${name}`);
 for(const d of p.drugs)if(d.validationStatus!=='documentary-summary'||Object.values(d.fields).some(f=>f.verification==='independently-reviewed'))fail('Un import ne peut revendiquer une validation indépendante.');
 if(p.questions.some(q=>q.validationStatus!=='demo')||p.cases.some(c=>c.steps.some(s=>s.question.validationStatus!=='demo'))||p.flashcards.some(c=>c.validationStatus!=='documentary-summary'))fail('Statut documentaire ou démonstration attendu.');
 if(p.questions.some(q=>q.id.length>150||q.statement.length>20000||q.correction.length>20000))fail('Question trop longue.');
});
export type ContentPack=z.infer<typeof contentPackSchema>;
export function checkContentRelations(pack:ContentPack,known:{sources:string[];classes:string[];drugs:string[];specialties:string[];systems:string[]}){
 const merged=(base:string[],extra:string[],label:string)=>{if(extra.some(id=>base.includes(id)))throw new Error(`Collision avec le catalogue initial : ${label}`);return new Set([...base,...extra]);};
 const sources=merged(known.sources,pack.sources.map(s=>s.id),'sources'),classes=merged(known.classes,pack.classes.map(c=>c.id),'classes'),drugs=merged(known.drugs,pack.drugs.map(d=>d.id),'médicaments'),specialties=merged(known.specialties,Object.keys(pack.specialties),'spécialités'),systems=merged(known.systems,Object.keys(pack.systems),'systèmes');
 const all=(ids:string[],set:Set<string>,label:string)=>{if(ids.some(id=>!set.has(id)))throw new Error(`Référence inconnue : ${label}`);};
 const evidence=(rows:{sourceId:string}[])=>all(rows.map(e=>e.sourceId),sources,'sources');
 for(const c of pack.classes){all(c.specialtyIds,specialties,'spécialités');all(c.systemIds,systems,'systèmes');if(c.parentId)all([c.parentId],classes,'classe parente');}
 const parents=new Map(pack.classes.map(c=>[c.id,c.parentId]));for(const c of pack.classes){const seen=new Set<string>();let current:string|undefined=c.id;while(current){if(seen.has(current))throw new Error('Cycle dans la hiérarchie des classes.');seen.add(current);current=parents.get(current);}}
 for(const d of pack.drugs){all([d.classId],classes,'classes');all(d.specialtyIds,specialties,'spécialités');all(d.systemIds,systems,'systèmes');Object.values(d.fields).forEach(f=>{evidence(f.evidence);if(f.status==='missing'&&f.absenceReview)evidence(f.absenceReview.evidence);});if(d.referenceNotice)evidence(d.referenceNotice.evidence);}
 const question=(q:ContentPack['questions'][number])=>{all(q.classIds,classes,'classes');all(q.drugIds,drugs,'médicaments');evidence(q.evidence);};
 pack.questions.forEach(question);for(const c of pack.cases){all(c.specialtyIds,specialties,'spécialités');evidence(c.evidence);c.steps.forEach(s=>question(s.question));}
 for(const c of pack.flashcards){all(c.classIds,classes,'classes');all(c.drugIds,drugs,'médicaments');evidence(c.evidence);}
}
