import {db} from './db';
import {clinicalCaseSchema,caseSessionSchema,answerCaseStep,advanceCase,type ProgressiveCase,type CaseSession} from '../domain/clinicalCases';
import type {Answer} from '../domain/models';
export async function startCase(dossier:ProgressiveCase){const session=caseSessionSchema.parse({id:crypto.randomUUID(),dossier:clinicalCaseSchema.parse(dossier),status:'active',startedAt:new Date().toISOString(),completedAt:null,currentStep:0,submittedSteps:[],answers:{},revision:0});await db.caseSessions.add(session);return session;}
export async function readCase(id:string){const raw=await db.caseSessions.get(id);if(!raw)throw new Error('Dossier absent de cet appareil.');return caseSessionSchema.parse(raw);}
async function mutate(id:string,expectedRevision:number,change:(s:CaseSession)=>CaseSession){return db.transaction('rw',db.caseSessions,async()=>{const current=await readCase(id);if(current.revision!==expectedRevision)throw new Error('Cette séance a changé dans un autre onglet. Rechargez pour reprendre la version enregistrée.');const next=change(current);await db.caseSessions.put(next);return next;});}
export function saveCaseAnswer(id:string,revision:number,answer:Answer,submit=false){return mutate(id,revision,s=>answerCaseStep(s,answer,submit));}
export function nextCaseStep(id:string,revision:number){return mutate(id,revision,s=>advanceCase(s));}
export async function caseSnapshot(){const raw=await db.caseSessions.orderBy('startedAt').reverse().toArray();return raw.map(s=>caseSessionSchema.parse(s));}
