import {z} from 'zod';
import {drugs,drugClasses} from '../data/drugs';
import {flashcards} from '../data/flashcards';
import {scoreAnswer} from './assessment';
import {dueKind,initialSchedule,localDate} from './spacedRepetition';
import type {AssessmentDraft,AssessmentResult,DrugHistory,Favorite,Flashcard,FlashcardReview,FlashcardSchedule,FlashcardSession,QuestionAttempt,StudyNote,UserProgress} from './models';
import type {CaseSession} from './clinicalCases';
export const planSchema=z.object({id:z.string().min(1),date:z.iso.date(),title:z.string().trim().min(1).max(120),kind:z.enum(['library','quiz','cards','case']),minutes:z.number().int().min(5).max(240),done:z.boolean(),createdAt:z.iso.datetime()}).strict();
export type StudyPlan=z.infer<typeof planSchema>;
export const studySettingsSchema=z.object({id:z.literal('user'),importantClassIds:z.array(z.string()).max(30)}).strict().superRefine((s,ctx)=>{if(new Set(s.importantClassIds).size!==s.importantClassIds.length||s.importantClassIds.some(id=>!drugClasses.some(c=>c.id===id)))ctx.addIssue({code:'custom',message:'Classe inconnue ou dupliquée'});});
export type StudySettings=z.infer<typeof studySettingsSchema>;
export interface StudyData {preferences:{id:'user';theme:'light'|'dark';weeklyGoal:number}[];favorites:Favorite[];history:DrugHistory[];progress:UserProgress[];notes:StudyNote[];assessments:AssessmentDraft[];assessmentResults:AssessmentResult[];attempts:QuestionAttempt[];customCards:Flashcard[];cardSchedules:FlashcardSchedule[];cardSessions:FlashcardSession[];cardReviews:FlashcardReview[];caseSessions:CaseSession[];planning:StudyPlan[];studySettings:StudySettings[];}
export const emptyStudyData:StudyData={preferences:[],favorites:[],history:[],progress:[],notes:[],assessments:[],assessmentResults:[],attempts:[],customCards:[],cardSchedules:[],cardSessions:[],cardReviews:[],caseSessions:[],planning:[],studySettings:[]};
export const planPaths:Record<StudyPlan['kind'],string>={library:'/bibliotheque',quiz:'/qcm',cards:'/flashcards',case:'/cas-cliniques'};
export interface StudyEvent {id:string;questionId:string;title:string;date:string;correct:boolean;classIds:string[];specialtyIds:string[];path:string;drugIds:string[];}
export function studyEvents(data:StudyData):StudyEvent[]{
 const events=new Map<string,StudyEvent>();
 for(const a of data.attempts){const session=data.assessmentResults.find(s=>s.id===a.sessionId)??data.assessments.find(s=>s.id===a.sessionId);const q=session?.questions.find(q=>q.id===a.questionId);if(!q||!session)continue;const score=scoreAnswer(q,a.answer,session.policy);events.set(a.id,{id:a.id,questionId:q.id,title:q.statement,date:a.recordedAt,correct:score.exact,classIds:q.classIds,specialtyIds:[...new Set(q.drugIds.flatMap(id=>drugs.find(d=>d.id===id)?.specialtyIds??[]))],path:`/seances/${a.sessionId}`,drugIds:q.drugIds});}
 for(const s of data.caseSessions)for(const index of s.submittedSteps){const q=s.dossier.steps[index].question;const score=scoreAnswer(q,s.answers[q.id],'exact');const id=`case:${s.id}:${q.id}`;events.set(id,{id,questionId:q.id,title:q.statement,date:s.submittedAt?.[q.id]??s.completedAt??s.startedAt,correct:score.exact,classIds:q.classIds,specialtyIds:s.dossier.specialtyIds,path:`/dossiers/${s.id}`,drugIds:q.drugIds});}
 return [...events.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
function seconds(start:string,end:string){return Math.max(0,Math.round((Date.parse(end)-Date.parse(start))/1000));}
export function studyStats(data:StudyData,now=new Date()){
 const events=studyEvents(data);const today=localDate(now);const monday=new Date(now.getFullYear(),now.getMonth(),now.getDate()-((now.getDay()+6)%7),12);const week=localDate(monday);
 const sessions=[...data.assessmentResults.map(r=>({end:r.completedAt,seconds:r.durationSeconds})),...data.cardSessions.filter(s=>s.status==='completed'&&s.completedAt).map(s=>({end:s.completedAt!,seconds:seconds(s.startedAt,s.completedAt!)})),...data.caseSessions.filter(s=>s.status==='completed'&&s.completedAt).map(s=>({end:s.completedAt!,seconds:seconds(s.startedAt,s.completedAt!)}))];
 const group=(ids:string[],key:'classIds'|'specialtyIds')=>ids.map(id=>{const subset=events.filter(e=>e[key].includes(id));return {id,count:subset.length,correct:subset.filter(e=>e.correct).length,rate:subset.length?Math.round(subset.filter(e=>e.correct).length/subset.length*100):null};});
 const days=new Map<string,{date:string;questions:number;correct:number}>();for(const e of events){const date=localDate(new Date(e.date));const row=days.get(date)??{date,questions:0,correct:0};row.questions++;if(e.correct)row.correct++;days.set(date,row);}
 const cards=[...flashcards,...data.customCards];const due=cards.filter(c=>['due','overdue'].includes(dueKind(data.cardSchedules.find(s=>s.cardId===c.id)??initialSchedule(c.id,today),today)));const overdue=due.filter(c=>(data.cardSchedules.find(s=>s.cardId===c.id)?.dueDate??today)<today);
 return {events,studied:data.progress.filter(p=>p.studiedAt).length,correct:events.filter(e=>e.correct).length,rate:events.length?Math.round(events.filter(e=>e.correct).length/events.length*100):null,minutes:Math.floor(sessions.reduce((sum,s)=>sum+s.seconds,0)/60),weeklyMinutes:Math.floor(sessions.filter(s=>{const day=localDate(new Date(s.end));return day>=week&&day<=today;}).reduce((sum,s)=>sum+s.seconds,0)/60),weeklyGoal:data.preferences[0]?.weeklyGoal??120,classes:group(drugClasses.map(c=>c.id),'classIds'),specialties:group([...new Set(drugs.flatMap(d=>d.specialtyIds))],'specialtyIds'),days:[...days.values()].sort((a,b)=>a.date.localeCompare(b.date)),due:due.length,overdue:overdue.length,reviews:data.cardReviews.length};
}
export interface Recommendation {id:string;title:string;reason:string;path:string;priority:number;}
export function recommendations(data:StudyData,now=new Date()):Recommendation[]{
 const stats=studyStats(data,now);const result:Recommendation[]=[];const latest=new Map(stats.events.map(e=>[e.questionId,e]));
 for(const e of [...latest.values()].filter(e=>!e.correct).reverse().slice(0,3))result.push({id:'failed:'+e.questionId,title:'Revoir une réponse échouée',reason:e.title,path:e.path,priority:1});
 const className=(id:string)=>drugClasses.find(c=>c.id===id)?.label??id;
 for(const c of stats.classes.filter(c=>c.count>=3&&c.rate!==null&&c.rate<60).slice(0,2))result.push({id:'weak:'+c.id,title:className(c.id),reason:`${c.correct}/${c.count} réponses entièrement correctes dans cette classe (seuil local : 60 %).`,path:`/qcm?classe=${c.id}`,priority:2});
 const cutoff=now.getTime()-14*86400000;const old=drugs.filter(d=>{const p=data.progress.find(p=>p.drugId===d.id);return !p?.studiedAt||Date.parse(p.studiedAt)<cutoff;}).sort((a,b)=>(data.progress.find(p=>p.drugId===a.id)?.studiedAt??'').localeCompare(data.progress.find(p=>p.drugId===b.id)?.studiedAt??''));
 for(const d of old.slice(0,2))result.push({id:'drug:'+d.id,title:d.fields.dci.value??d.id,reason:data.progress.find(p=>p.drugId===d.id)?.studiedAt?'Dernier marquage « étudié » datant de plus de 14 jours.':'Fiche jamais marquée comme étudiée sur cet appareil.',path:`/medicaments/${d.id}`,priority:3});
 if(stats.due)result.push({id:'due',title:'Flashcards à échéance',reason:`${stats.due} carte(s) à revoir, dont ${stats.overdue} en retard.`,path:'/flashcards',priority:4});
 for(const id of data.studySettings[0]?.importantClassIds??[])result.push({id:'interest:'+id,title:className(id),reason:'Thème important sélectionné par vous.',path:`/bibliotheque?classe=${id}`,priority:5});
 return result.sort((a,b)=>a.priority-b.priority);
}
