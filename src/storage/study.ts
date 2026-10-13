import {db} from './db';
import {emptyStudyData,planSchema,studySettingsSchema,type StudyData,type StudyPlan} from '../domain/study';
export const personalTables=Object.keys(emptyStudyData) as (keyof StudyData)[];
export async function studySnapshot():Promise<StudyData>{return db.transaction('r',personalTables.map(name=>db.table(name)),async()=>{const values=await Promise.all(personalTables.map(name=>db.table(name).toArray()));return Object.fromEntries(personalTables.map((name,i)=>[name,values[i]])) as unknown as StudyData;});}
export async function addStudyPlan(value:Omit<StudyPlan,'id'|'done'|'createdAt'>){const plan=planSchema.parse({...value,id:crypto.randomUUID(),done:false,createdAt:new Date().toISOString()});await db.planning.add(plan);return plan;}
export async function markStudyPlan(id:string,done:boolean){await db.transaction('rw',db.planning,async()=>{const row=await db.planning.get(id);if(!row)throw new Error('Séance absente.');await db.planning.put({...row,done});});}
export async function saveStudyInterests(ids:string[]){await db.studySettings.put(studySettingsSchema.parse({id:'user',importantClassIds:ids}));}
