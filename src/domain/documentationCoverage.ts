import {fieldGroups,type Drug,type Question,type Provenance} from './models';
import type {ProgressiveCase} from './clinicalCases';
const day=86400000;
export function documentationCoverage(drugs:Drug[],questions:Question[],cases:ProgressiveCase[],today:string){
 const cutoff=Date.parse(today+'T00:00:00Z');if(!Number.isFinite(cutoff))throw Error('Date de bilan invalide.');
 const rows=drugs.map(drug=>{
  const fields=fieldGroups.flatMap(g=>g.keys.map(key=>({key,field:drug.fields[key]})));
  const available=fields.filter(({field})=>field.status==='available');
  const evidence:Provenance[]=available.flatMap(({field})=>field.evidence);
  const needsReview=available.filter(({field})=>field.evidence.some(e=>cutoff-Date.parse(e.consultedAt+'T00:00:00Z')>180*day)).map(({key})=>key);
  return {drugId:drug.id,name:drug.fields.dci.value??drug.id,classId:drug.classId,available:available.length,pedagogical:available.filter(({field})=>field.status==='available'&&field.presentation==='pedagogical').length,total:fields.length,missing:fields.filter(({field})=>field.status==='missing').map(({key,field})=>({key,reason:field.status==='missing'?field.reason:'',...(field.status==='missing'&&field.absenceReview?{absenceReview:field.absenceReview}:{})})),needsReview,lastConsultedAt:evidence.map(e=>e.consultedAt).sort().at(-1)??null,independentlyReviewed:drug.validationStatus==='independently-reviewed',questions:questions.filter(q=>q.drugIds.includes(drug.id)).length,cases:cases.filter(c=>c.steps.some(s=>s.question.drugIds.includes(drug.id))).length};
 });
 return {schemaVersion:1 as const,generatedFor:today,reviewAfterDays:180,drugs:rows,available:rows.reduce((n,r)=>n+r.available,0),pedagogical:rows.reduce((n,r)=>n+r.pedagogical,0),reviewedMissing:rows.flatMap(r=>r.missing).filter(f=>f.absenceReview).length,total:rows.reduce((n,r)=>n+r.total,0),questions:questions.length,reviewedQuestions:questions.filter(q=>q.validationStatus==='reviewed').length,cases:cases.length};
}
