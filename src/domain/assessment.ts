import { z } from 'zod';
import type { Answer, AssessmentDraft, AssessmentResult, Question, QuestionScore, ScoringPolicy } from './models';
const evidence=z.object({sourceId:z.string().min(1),url:z.url().refine(s=>s.startsWith('https://')),consultedAt:z.iso.date(),sourceUpdatedAt:z.iso.date().nullable(),locator:z.string().min(1)}).strict();
export const questionSchema=z.object({id:z.string().min(1),type:z.enum(['qcu','qrm','qroc','true-false','association','pharmacokinetics']),statement:z.string().min(1),equation:z.string().max(2000).optional(),drugIds:z.array(z.string()),options:z.array(z.object({id:z.string().min(1),text:z.string().min(1),correct:z.boolean(),explanation:z.string().min(1)}).strict()),expectedConcepts:z.array(z.array(z.string().min(1)).min(1)).optional(),associationItems:z.array(z.object({id:z.string(),prompt:z.string(),expectedChoiceId:z.string(),explanation:z.string().min(1)}).strict()).optional(),associationChoices:z.array(z.object({id:z.string(),text:z.string()}).strict()).optional(),expectedNumeric:z.object({value:z.number().finite(),tolerance:z.number().nonnegative(),unit:z.string().min(1)}).strict().optional(),correction:z.string().min(1),difficulty:z.union([z.literal(1),z.literal(2),z.literal(3)]),classIds:z.array(z.string()).min(1),objectiveIds:z.array(z.string()).min(1),evidence:z.array(evidence).min(1),validationStatus:z.enum(['demo','reviewed'])}).strict().superRefine((q,ctx)=>{
 const fail=(message:string)=>ctx.addIssue({code:'custom',message});
 if(new Set(q.options.map(o=>o.id)).size!==q.options.length)fail('Propositions dupliquées');
 if(['qcu','true-false'].includes(q.type)&&(q.options.length<2||q.options.filter(o=>o.correct).length!==1))fail('Une réponse correcte attendue');
 if(q.type==='true-false'&&q.options.length!==2)fail('Deux propositions attendues');
 if(q.type==='qrm'&&(q.options.length<2||!q.options.some(o=>o.correct)))fail('QRM sans réponse correcte');
 if(q.type==='qroc'&&!q.expectedConcepts?.length)fail('Concepts QROC manquants');
 if(q.type==='pharmacokinetics'&&!q.expectedNumeric)fail('Valeur numérique manquante');
 if(q.type==='association'){if(!q.associationItems?.length||!q.associationChoices?.length)fail('Associations manquantes');else {if(new Set(q.associationItems.map(i=>i.id)).size!==q.associationItems.length||new Set(q.associationChoices.map(i=>i.id)).size!==q.associationChoices.length)fail('Identifiants d’association dupliqués');if(q.associationItems.some(i=>!q.associationChoices!.some(c=>c.id===i.expectedChoiceId)))fail('Cible d’association inconnue');}}
});
export function parseQuestions(value:unknown):Question[]{const questions=z.array(questionSchema).min(1).parse(value);if(new Set(questions.map(q=>q.id)).size!==questions.length)throw new Error('Identifiants dupliqués');return questions;}
export const answerSchema=z.object({questionId:z.string(),selectedOptionIds:z.array(z.string()),text:z.string().max(2000).optional(),associations:z.record(z.string(),z.string()).optional()}).strict();
export function emptyAnswer(q:Question):Answer{return {questionId:q.id,selectedOptionIds:[]};}
export function hasResponse(q:Question,a:Answer){return q.type==='association'?Object.values(a.associations??{}).some(Boolean):['qroc','pharmacokinetics'].includes(q.type)?!!a.text?.trim():a.selectedOptionIds.length>0;}
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function scoreAnswer(q:Question,raw:Answer,policy:ScoringPolicy):QuestionScore {
 const a=answerSchema.parse(raw);if(a.questionId!==q.id)throw new Error('Réponse à une autre question');if(!['exact','partial'].includes(policy))throw new Error('Barème inconnu');
 const answerIds=[...new Set(a.selectedOptionIds)];if(answerIds.some(id=>!q.options.some(o=>o.id===id)))throw new Error('Proposition inconnue');
 let fraction=0;const detectedConcepts:number[]=[];let feedback='';
 if(!hasResponse(q,a))return {questionId:q.id,score:0,exact:false,feedback:'Question sans réponse : 0 point.',detectedConcepts};
 if(q.type==='qroc'){
  const text=normalize(a.text??'');const negated=/\b(ne|pas|non|sans|aucun|jamais)\b/.test(text);
  for(const [i,aliases] of (q.expectedConcepts??[]).entries())if(aliases.some(alias=>(' '+text+' ').includes(' '+normalize(alias)+' ')))detectedConcepts.push(i);
  fraction=negated?0:detectedConcepts.length/(q.expectedConcepts?.length??1);
  feedback=negated?'Négation détectée : correction automatique suspendue, score 0 par convention ; comparez votre réponse au corrigé.':`${detectedConcepts.length}/${q.expectedConcepts?.length??0} concepts détectés. Une concordance lexicale ne garantit pas la justesse du raisonnement.`;
 } else if(q.type==='pharmacokinetics'){
  const input=(a.text??'').trim().replace(',','.');const n=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(input)?Number(input):NaN;fraction=q.expectedNumeric&&Number.isFinite(n)&&Math.abs(n-q.expectedNumeric.value)<=q.expectedNumeric.tolerance+1e-9?1:0;feedback=`Valeur attendue : ${q.expectedNumeric?.value} ${q.expectedNumeric?.unit} ; tolérance ± ${q.expectedNumeric?.tolerance}.`;
 } else if(q.type==='association'){
  for(const [id,choice] of Object.entries(a.associations??{})){if(!q.associationItems?.some(i=>i.id===id)|| (choice&&!q.associationChoices?.some(c=>c.id===choice)))throw new Error('Association inconnue');}
  const items=q.associationItems??[];fraction=items.filter(i=>a.associations?.[i.id]===i.expectedChoiceId).length/items.length;feedback=`${Math.round(fraction*items.length)}/${items.length} associations correctes.`;
 } else {
  if(q.type!=='qrm'&&answerIds.length>1)throw new Error('Une seule réponse autorisée');
  const expected=q.options.filter(o=>o.correct).map(o=>o.id);const errors=q.options.filter(o=>o.correct!==answerIds.includes(o.id)).length;
  fraction=q.type==='qrm'?Math.max(0,1-errors/q.options.length):(answerIds.length===expected.length&&expected.every(id=>answerIds.includes(id))?1:0);
  feedback=errors?`${errors} erreur(s) de sélection ou omission.`:'Toutes les propositions sont correctement traitées.';
 }
 const exact=fraction===1;return {questionId:q.id,score:policy==='exact'?(exact?1:0):fraction,exact,feedback,detectedConcepts};
}
export function remainingSeconds(deadlineAt:string|null,now=Date.now()){return deadlineAt?Math.max(0,Math.ceil((Date.parse(deadlineAt)-now)/1000)):null;}
export function resultFromDraft(d:AssessmentDraft,endedBy:AssessmentResult['endedBy'],now=Date.now()):AssessmentResult {
 const end=Math.max(Date.parse(d.startedAt),Math.min(now,d.deadlineAt?Date.parse(d.deadlineAt):now));const scores=d.questions.map(q=>scoreAnswer(q,d.answers[q.id]??emptyAnswer(q),d.policy));
 return {id:d.id,mode:d.mode,startedAt:d.startedAt,completedAt:new Date(end).toISOString(),durationSeconds:Math.round((end-Date.parse(d.startedAt))/1000),questions:d.questions,answers:d.answers,scores,total:scores.reduce((sum,s)=>sum+s.score,0),maximum:d.questions.length,policy:d.policy,contentVersion:d.contentVersion,endedBy};
}
export const scoringDescriptions:Record<ScoringPolicy,string>={exact:'1 point si toute la réponse est correcte, sinon 0. Aucune pénalité négative.',partial:'QRM : max(0, 1 − erreurs / nombre de propositions). Associations et QROC : proportion d’éléments reconnus. Autres formats : 0 ou 1. Aucune pénalité négative.'};

export const draftSchema=z.object({id:z.string().min(1),mode:z.enum(['training','exam']),status:z.enum(['active','completed']),startedAt:z.iso.datetime(),deadlineAt:z.iso.datetime().nullable(),completedAt:z.iso.datetime().nullable(),questions:z.array(questionSchema).min(1).max(100),contentVersion:z.string().min(1),policy:z.enum(['exact','partial']),answers:z.record(z.string(),answerSchema),lockedQuestionIds:z.array(z.string()),currentIndex:z.number().int().nonnegative()}).strict().superRefine((d,ctx)=>{const fail=(message:string)=>ctx.addIssue({code:'custom',message});if(d.currentIndex>=d.questions.length)fail('Index hors limites');if(new Set(d.questions.map(q=>q.id)).size!==d.questions.length)fail('Questions dupliquées');if(d.mode==='exam'&&!d.deadlineAt)fail('Échéance manquante');if(d.deadlineAt&&Date.parse(d.deadlineAt)<=Date.parse(d.startedAt))fail('Échéance invalide');for(const [id,a] of Object.entries(d.answers)){const q=d.questions.find(q=>q.id===id);if(!q||a.questionId!==id)fail('Réponse inconnue');else try{scoreAnswer(q,a,d.policy);}catch{fail('Réponse invalide');}}if(d.lockedQuestionIds.some(id=>!d.questions.some(q=>q.id===id)))fail('Question verrouillée inconnue');});
