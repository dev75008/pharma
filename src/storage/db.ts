import { questionContentVersion } from '../data/questions';
import type {OpenfdaCache} from '../data/adapters/openfda';
import {shuffledQuestions} from '../domain/questionOrder';
import type { Conformer } from '../data/adapters/conformer';
import type { TrialsCache } from '../data/adapters/clinicalTrials';
import type { RxnormCache } from '../data/adapters/rxnorm';
import type { ChemblKnowledge } from '../data/adapters/chemblMechanisms';
import type { MolecularCache } from '../data/adapters/molecular';
import type { StudyPlan, StudySettings } from '../domain/study';
import type { CaseSession } from '../domain/clinicalCases';
import type { LiteratureCache } from '../data/adapters/europePmc';
import type { DocumentCacheEntry } from '../data/adapters/ansmDocuments';
import type { ApiCacheEntry } from '../data/adapters/medicamentsApi';
import Dexie, { type EntityTable } from 'dexie';
import { draftSchema, emptyAnswer, parseQuestions, remainingSeconds, resultFromDraft, scoreAnswer } from '../domain/assessment';
import type { Flashcard, FlashcardSchedule, FlashcardSession, FlashcardReview, AssessmentDraft, AssessmentResult, Question, QuestionAttempt, ScoringPolicy, DrugHistory, Favorite, StudyNote, UserProgress } from '../domain/models';
export interface Preferences { id: 'user'; theme: 'light' | 'dark'; weeklyGoal: number; }
export const db = new Dexie('medrevision') as Dexie & { openfdaCache: EntityTable<OpenfdaCache,'key'>; conformers: EntityTable<Conformer,'key'>; trialsCache: EntityTable<TrialsCache,'key'>; rxnormCache: EntityTable<RxnormCache,'key'>; chemblKnowledge: EntityTable<ChemblKnowledge,'key'>; molecularCache: EntityTable<MolecularCache,'key'>; planning: EntityTable<StudyPlan,'id'>; studySettings: EntityTable<StudySettings,'id'>; caseSessions: EntityTable<CaseSession,'id'>; literature: EntityTable<LiteratureCache,'key'>; apiDocuments: EntityTable<DocumentCacheEntry,'key'>; apiCache: EntityTable<ApiCacheEntry,'key'>; preferences: EntityTable<Preferences, 'id'>; favorites: EntityTable<Favorite,'drugId'>; history: EntityTable<DrugHistory,'drugId'>; progress: EntityTable<UserProgress,'drugId'>; notes: EntityTable<StudyNote,'drugId'>; assessments: EntityTable<AssessmentDraft,'id'>; assessmentResults: EntityTable<AssessmentResult,'id'>; attempts: EntityTable<QuestionAttempt,'id'>; customCards: EntityTable<Flashcard,'id'>; cardSchedules: EntityTable<FlashcardSchedule,'cardId'>; cardSessions: EntityTable<FlashcardSession,'id'>; cardReviews: EntityTable<FlashcardReview,'id'> };
db.version(1).stores({ preferences: 'id' });
db.version(2).stores({ preferences:'id',favorites:'drugId,createdAt',history:'drugId,lastViewedAt',progress:'drugId,studiedAt',notes:'drugId' });
db.version(3).stores({assessments:'id,mode,status,startedAt',assessmentResults:'id,mode,completedAt',attempts:'id,sessionId,questionId,recordedAt'});
db.version(4).stores({customCards:'id,*classIds,createdAt',cardSchedules:'cardId,dueDate,suspended',cardSessions:'id,status,startedAt',cardReviews:'id,sessionId,cardId,reviewedAt'});
db.version(5).stores({apiCache:'key,retrievedAt,expiresAt'});
db.version(6).stores({apiDocuments:'key,retrievedAt,expiresAt'});
db.version(7).stores({literature:'key,retrievedAt,expiresAt'});
db.version(8).stores({caseSessions:'id,status,startedAt,completedAt'});
db.version(9).stores({planning:'id,date,done',studySettings:'id'});
db.version(10).stores({molecularCache:'key,retrievedAt,expiresAt'});
db.version(11).stores({chemblKnowledge:'key,retrievedAt,expiresAt'});
db.version(12).stores({rxnormCache:'key,retrievedAt,expiresAt'});
db.version(13).stores({trialsCache:'key,retrievedAt,expiresAt'});
db.version(14).stores({conformers:'key,retrievedAt,expiresAt'});
db.version(15).stores({openfdaCache:'key,retrievedAt,expiresAt'});
export const defaultPreferences: Preferences = { id:'user',theme:'light',weeklyGoal:120 };
export async function readPreferences() { return (await db.preferences.get('user')) ?? defaultPreferences; }
export async function savePreferences(value:Preferences) { await db.preferences.put(value); }
export async function toggleFavorite(drugId:string) {await db.transaction('rw',db.favorites,async()=>{if(await db.favorites.get(drugId))await db.favorites.delete(drugId);else await db.favorites.put({drugId,createdAt:new Date().toISOString()});});}
export async function recordVisit(drugId:string) {await db.transaction('rw',db.history,async()=>{const previous=await db.history.get(drugId);await db.history.put({drugId,lastViewedAt:new Date().toISOString(),visitCount:(previous?.visitCount??0)+1});});}
export async function setStudied(drugId:string,studied:boolean) {await db.progress.put({drugId,studiedAt:studied?new Date().toISOString():null});}
export async function saveNote(drugId:string,text:string) {if(text.length>10000)throw new Error('Note trop longue');await db.notes.put({drugId,text,updatedAt:new Date().toISOString()});}
export async function librarySnapshot() {return db.transaction('r',db.favorites,db.history,db.progress,db.notes,async()=>({favorites:await db.favorites.toArray(),history:await db.history.orderBy('lastViewedAt').reverse().limit(20).toArray(),progress:await db.progress.toArray(),notes:await db.notes.toArray()}));}

export async function createAssessment(mode:AssessmentDraft['mode'],selected:Question[],policy:ScoringPolicy,durationMinutes:number,mix=false){
 if(!Number.isInteger(durationMinutes)||durationMinutes<1||durationMinutes>120)throw new Error('Durée invalide');
 if(selected.length>100)throw new Error('Une séance comporte au maximum 100 questions.');const bank=parseQuestions(mix?shuffledQuestions(selected):selected);const start=Date.now();const draft:AssessmentDraft={id:crypto.randomUUID(),mode,status:'active',startedAt:new Date(start).toISOString(),deadlineAt:mode==='exam'?new Date(start+durationMinutes*60000).toISOString():null,completedAt:null,questions:bank,contentVersion:questionContentVersion,policy,answers:{},lockedQuestionIds:[],currentIndex:0};await db.assessments.add(draftSchema.parse(draft));return draft;
}
export async function saveAssessment(next:AssessmentDraft,lockId?:string){return db.transaction('rw',db.assessments,db.attempts,async()=>{
 const old=await db.assessments.get(next.id);if(!old||old.status!=='active')throw new Error('Séance terminée ou absente');
 if(old.deadlineAt&&remainingSeconds(old.deadlineAt)===0)throw new Error('Temps écoulé');
 const value=draftSchema.parse(next);if(value.mode!==old.mode||value.startedAt!==old.startedAt||value.deadlineAt!==old.deadlineAt||value.policy!==old.policy||JSON.stringify(value.questions)!==JSON.stringify(old.questions))throw new Error('Configuration modifiée');
 for(const id of old.lockedQuestionIds){value.answers[id]=old.answers[id];if(!value.lockedQuestionIds.includes(id))value.lockedQuestionIds.push(id);}
 if(lockId){if(value.mode!=='training')throw new Error('Correction interdite avant fin d’examen');const question=value.questions.find(q=>q.id===lockId);if(!question)throw new Error('Question inconnue');const answer=value.answers[lockId]??emptyAnswer(question);value.lockedQuestionIds=[...new Set([...value.lockedQuestionIds,lockId])];await db.attempts.put({id:value.id+':'+lockId,sessionId:value.id,questionId:lockId,mode:value.mode,recordedAt:new Date().toISOString(),answer,score:scoreAnswer(question,answer,value.policy),classIds:question.classIds});}
 await db.assessments.put(value);return value;
 });}
export async function finishAssessment(id:string,finalDraft?:AssessmentDraft){return db.transaction('rw',db.assessments,db.assessmentResults,db.attempts,async()=>{
 const existing=await db.assessmentResults.get(id);if(existing)return existing;
 const stored=await db.assessments.get(id);if(!stored)throw new Error('Séance introuvable');const expired=!!stored.deadlineAt&&remainingSeconds(stored.deadlineAt)===0;
 // À échéance, seules les réponses déjà enregistrées sont corrigées.
 const draft=draftSchema.parse(expired||!finalDraft?stored:finalDraft);
 if(draft.id!==stored.id||draft.mode!==stored.mode||draft.policy!==stored.policy||draft.startedAt!==stored.startedAt||draft.deadlineAt!==stored.deadlineAt||JSON.stringify(draft.questions)!==JSON.stringify(stored.questions))throw new Error('Configuration modifiée');
 for(const qid of stored.lockedQuestionIds)draft.answers[qid]=stored.answers[qid];
 const result=resultFromDraft(draft,expired?'deadline':'user');await db.assessmentResults.add(result);await db.assessments.put({...draft,status:'completed',completedAt:result.completedAt});
 for(const [index,q] of result.questions.entries()){const attemptId=id+':'+q.id;if(!await db.attempts.get(attemptId))await db.attempts.put({id:attemptId,sessionId:id,questionId:q.id,mode:result.mode,recordedAt:result.completedAt,answer:result.answers[q.id]??emptyAnswer(q),score:result.scores[index],classIds:q.classIds});}return result;
 });}
export async function assessmentSnapshot(){return db.transaction('r',db.assessments,db.assessmentResults,db.attempts,async()=>({drafts:(await db.assessments.toArray()).filter(d=>d.status==='active'),results:await db.assessmentResults.orderBy('completedAt').reverse().toArray(),attempts:await db.attempts.orderBy('recordedAt').toArray()}));}
