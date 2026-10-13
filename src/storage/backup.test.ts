import {beforeEach,expect,it} from 'vitest';
import {db,createAssessment,saveAssessment,finishAssessment} from './db';
import {personalTables} from './study';
import {exportBackup,importBackup} from './backup';
import {parseBackup,canonicalJson} from '../domain/backup';
import {questions} from '../data/questions';
import {clinicalCases} from '../data/clinicalCases';
import {startCase,saveCaseAnswer,nextCaseStep} from './clinicalCases';
import {createFlashcardSession,reviewFlashcard} from './flashcards';
import {flashcards} from '../data/flashcards';
beforeEach(async()=>{await Promise.all(personalTables.map(name=>db.table(name).clear()));});
it('exporte et restaure résultats, dossier en cours, notes et planning sans doublons',async()=>{
 const q=questions[0];let draft=await createAssessment('training',[q],'exact',10);draft=await saveAssessment({...draft,answers:{[q.id]:{questionId:q.id,selectedOptionIds:['a']}}},q.id);await finishAssessment(draft.id);
 let session=await startCase(clinicalCases[0]);const cq=session.dossier.steps[0].question;session=await saveCaseAnswer(session.id,0,{questionId:cq.id,selectedOptionIds:['a','c']},true);await nextCaseStep(session.id,session.revision);
 await db.notes.put({drugId:'bisoprolol',text:'Note personnelle',updatedAt:new Date().toISOString()});await db.planning.put({id:'plan',date:'2026-10-13',title:'Mes QCM',kind:'quiz',minutes:20,done:false,createdAt:new Date().toISOString()});
 const text=await exportBackup();const backup=parseBackup(text);expect(backup.data.assessmentResults[0].total).toBe(1);expect(text).not.toContain('apiCache');
 await Promise.all(personalTables.map(name=>db.table(name).clear()));const result=await importBackup(text);expect(result.added).toBeGreaterThan(0);expect(canonicalJson(parseBackup(await exportBackup()).data)).toBe(canonicalJson(backup.data));
 expect((await importBackup(text)).added).toBe(0);
});
it('refuse versions, doublons et scores altérés avant toute écriture',async()=>{
 const raw=JSON.parse(await exportBackup());raw.version=9;expect(()=>parseBackup(JSON.stringify(raw))).toThrow('version');
 const q=questions[0];const draft=await createAssessment('training',[q],'exact',10);await finishAssessment(draft.id);const backup=JSON.parse(await exportBackup());backup.data.assessmentResults[0].total=1;await expect(importBackup(JSON.stringify(backup))).rejects.toThrow('incohérente');expect(await db.assessmentResults.count()).toBe(1);
});
it('annule les ajouts précédents si une donnée existante entre en conflit',async()=>{
 await db.planning.put({id:'collision',date:'2026-10-13',title:'Original',kind:'quiz',minutes:20,done:false,createdAt:new Date().toISOString()});const backup=JSON.parse(await exportBackup());backup.data.planning[0].title='Différent';backup.data.notes.push({drugId:'bisoprolol',text:'Nouvelle note',updatedAt:new Date().toISOString()});
 await expect(importBackup(JSON.stringify(backup))).rejects.toThrow('Conflit');expect(await db.notes.count()).toBe(0);expect((await db.planning.get('collision'))?.title).toBe('Original');
});
it('restaure une séance de flashcards active avec son calendrier et ses rappels',async()=>{
 const session=await createFlashcardSession([flashcards[0]],'scheduled');await reviewFlashcard(session.id,0,'again');const text=await exportBackup();const backup=parseBackup(text);expect(backup.data.cardSessions[0].status).toBe('active');expect(backup.data.cardReviews).toHaveLength(1);
 await Promise.all(personalTables.map(name=>db.table(name).clear()));await importBackup(text);expect((await db.cardSchedules.get(flashcards[0].id))?.repetitions).toBe(0);expect((await db.cardSessions.get(session.id))?.cursor).toBe(1);expect(canonicalJson(parseBackup(await exportBackup()).data)).toBe(canonicalJson(backup.data));
});
