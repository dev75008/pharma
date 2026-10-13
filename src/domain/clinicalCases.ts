import {z} from 'zod';
import {answerSchema,emptyAnswer,hasResponse,questionSchema,scoreAnswer} from './assessment';
import type {Answer} from './models';
export const clinicalCaseSchema=z.object({id:z.string().min(1),title:z.string().min(1),fictional:z.literal(true),specialtyIds:z.array(z.string()).min(1),introduction:z.string().min(1),patient:z.object({history:z.string(),treatments:z.string(),symptoms:z.string(),vitals:z.string()}).strict(),contentVersion:z.string().min(1),steps:z.array(z.object({id:z.string(),title:z.string(),information:z.string().min(1),question:questionSchema}).strict()).min(1).max(30),evidence:questionSchema.shape.evidence,validationStatus:z.literal('demo')}).strict().superRefine((c,ctx)=>{
 if(new Set(c.steps.map(s=>s.id)).size!==c.steps.length||new Set(c.steps.map(s=>s.question.id)).size!==c.steps.length)ctx.addIssue({code:'custom',message:'Étapes ou questions dupliquées'});
});
export type ProgressiveCase=z.infer<typeof clinicalCaseSchema>;
export const caseSessionSchema=z.object({id:z.string().min(1),dossier:clinicalCaseSchema,status:z.enum(['active','completed']),startedAt:z.iso.datetime(),completedAt:z.iso.datetime().nullable(),currentStep:z.number().int().nonnegative(),submittedSteps:z.array(z.number().int().nonnegative()),submittedAt:z.record(z.string(),z.iso.datetime()).optional(),answers:z.record(z.string(),answerSchema),revision:z.number().int().nonnegative()}).strict().superRefine((s,ctx)=>{
 const fail=(message:string)=>ctx.addIssue({code:'custom',message});
 if(s.currentStep>=s.dossier.steps.length)fail('Étape hors limites');
 if(s.submittedSteps.some((step,i)=>step!==i)||s.submittedSteps.length<s.currentStep||s.submittedSteps.length>s.currentStep+1)fail('Progression incohérente');
 if(s.status==='completed'&&(s.submittedSteps.length!==s.dossier.steps.length||!s.completedAt))fail('Dossier incomplet');
 if(s.status==='active'&&s.completedAt)fail('Date de fin inattendue');
 if(s.completedAt&&Date.parse(s.completedAt)<Date.parse(s.startedAt))fail('Chronologie invalide');
 for(const [id,answer] of Object.entries(s.answers)){
  const index=s.dossier.steps.findIndex(step=>step.question.id===id);
  if(index<0||index>s.currentStep)fail('Réponse à une étape non révélée');
  else try{scoreAnswer(s.dossier.steps[index].question,answer,'exact');}catch{fail('Réponse invalide');}
 }
 for(const index of s.submittedSteps){const q=s.dossier.steps[index]?.question;if(!q||!s.answers[q.id]||!hasResponse(q,s.answers[q.id]))fail('Étape validée sans réponse');}
});
export type CaseSession=z.infer<typeof caseSessionSchema>;
export function caseScores(session:CaseSession){return session.dossier.steps.filter((_,i)=>session.submittedSteps.includes(i)).map(s=>scoreAnswer(s.question,session.answers[s.question.id]??emptyAnswer(s.question),'exact'));}
export function answerCaseStep(raw:CaseSession,answer:Answer,submit=false):CaseSession{
 const session=caseSessionSchema.parse(raw);if(session.status!=='active')throw new Error('Dossier déjà terminé.');
 if(session.submittedSteps.includes(session.currentStep))throw new Error('Réponse déjà verrouillée.');
 const q=session.dossier.steps[session.currentStep].question;scoreAnswer(q,answer,'exact');
 if(submit&&!hasResponse(q,answer))throw new Error('Répondez avant de valider.');
 return caseSessionSchema.parse({...session,answers:{...session.answers,[q.id]:answer},submittedSteps:submit?[...session.submittedSteps,session.currentStep]:session.submittedSteps,...(submit?{submittedAt:{...session.submittedAt,[q.id]:new Date().toISOString()}}:{}),revision:session.revision+1});
}
export function advanceCase(raw:CaseSession,now=new Date().toISOString()):CaseSession{
 const s=caseSessionSchema.parse(raw);if(s.status!=='active'||!s.submittedSteps.includes(s.currentStep))throw new Error('Validez l’étape actuelle avant de poursuivre.');
 const last=s.currentStep===s.dossier.steps.length-1;
 return caseSessionSchema.parse({...s,currentStep:last?s.currentStep:s.currentStep+1,status:last?'completed':'active',completedAt:last?now:null,revision:s.revision+1});
}
