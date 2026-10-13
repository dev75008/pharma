import {z} from 'zod';
import {questions} from '../data/questions';
import {drugClasses} from '../data/drugs';
import {studyStats,type StudyData} from './study';
import type {Question} from './models';

export const dailyPracticeVersion='daily-practice-1';
export interface DailyQuestion {question:Question;priority:number;reason:string;lastCorrectedAt:string|null;}

// Rotation déterministe des égalités : même jour + mêmes données = même sélection.
function dailyOrder(day:string,id:string){let value=2166136261;for(const char of `${day}:${id}`)value=Math.imul(value^char.charCodeAt(0),16777619);return value>>>0;}
export function dailyPractice(data:StudyData,day:string,count:number):DailyQuestion[]{
 z.iso.date().parse(day);z.number().int().min(1).max(questions.length).parse(count);
 const stats=studyStats(data);const bankIds=new Set(questions.map(q=>q.id));
 const latest=new Map(stats.events.filter(e=>bankIds.has(e.questionId)).map(e=>[e.questionId,e]));
 const weak=stats.classes.filter(c=>c.count>=3&&c.rate!==null&&c.rate<60);
 const interests=data.studySettings[0]?.importantClassIds??[];
 const label=(id:string)=>drugClasses.find(c=>c.id===id)?.label??id;
 const rows=questions.map(question=>{
  const event=latest.get(question.id);const weakClass=weak.find(c=>question.classIds.includes(c.id));const interest=interests.find(id=>question.classIds.includes(id));
  let priority:number;let reason:string;
  if(event&&!event.correct){priority=1;reason='Dernière correction de cette question : réponse à revoir.';}
  else if(weakClass){priority=2;reason=`Classe ${label(weakClass.id)} : ${weakClass.correct}/${weakClass.count} corrections entièrement correctes (seuil local 60 %, au moins 3 corrections).`;}
  else if(interest){priority=3;reason=`Thème choisi par vous : ${label(interest)}.`;}
  else if(!event){priority=4;reason='Aucune correction enregistrée pour cette question sur cet appareil.';}
  else{priority=5;reason='Question déjà corrigée correctement : rappel, du moins récemment corrigé au plus récent.';}
  return {question,priority,reason,lastCorrectedAt:event?.date??null};
 });
 return rows.sort((a,b)=>a.priority-b.priority||(a.lastCorrectedAt??'').localeCompare(b.lastCorrectedAt??'')||dailyOrder(day,a.question.id)-dailyOrder(day,b.question.id)||a.question.id.localeCompare(b.question.id)).slice(0,count);
}
