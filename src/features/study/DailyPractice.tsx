import {useId,useRef,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {questions,questionTypeLabels} from '../../data/questions';
import {dailyPractice} from '../../domain/dailyPractice';
import {scoringDescriptions} from '../../domain/assessment';
import type {StudyData} from '../../domain/study';
import type {ScoringPolicy} from '../../domain/models';
import {createAssessment} from '../../storage/db';

export function DailyPractice({data,day,loading,error}:{data:StudyData;day:string;loading:boolean;error:string}){
 const [count,setCount]=useState(Math.min(5,questions.length));const [policy,setPolicy]=useState<ScoringPolicy>('exact');
 const [busy,setBusy]=useState(false);const [actionError,setActionError]=useState('');const pending=useRef(false);
 const countId=useId();const policyId=useId();const navigate=useNavigate();
 const selection=loading||error?[]:dailyPractice(data,day,count);
 const active=data.assessments.filter(s=>s.mode==='training'&&s.status==='active').sort((a,b)=>b.startedAt.localeCompare(a.startedAt));
 async function start(){
  if(pending.current||loading||error||!selection.length)return;
  pending.current=true;setBusy(true);setActionError('');
  try{const draft=await createAssessment('training',selection.map(row=>row.question),policy,10);navigate(`/seances/${draft.id}`);}
  catch{setActionError('La séance ne peut pas être enregistrée. Vos données existantes sont conservées ; réessayez lorsque le stockage est disponible.');}
  finally{pending.current=false;setBusy(false);}
 }
 return <section className="panel study-section daily-practice" aria-label="Entraînement quotidien personnalisé">
  <h2>Mon entraînement quotidien</h2>
  <p>Sélection du {day} à partir de vos corrections et thèmes enregistrés. Priorités : dernières erreurs, classes à moins de 60 % avec au moins trois corrections, thèmes choisis, questions sans correction puis rappels anciens. Les égalités tournent selon le jour.</p>
  <p><strong>Banque de démonstration non validée.</strong> {questions.length} questions existantes avec sources. Le classement est pédagogique ; il ne mesure pas une compétence clinique.</p>
  <div className="filter-row"><div><label htmlFor={countId}>Questions de la séance quotidienne</label><select id={countId} value={count} disabled={busy||loading||!!error} onChange={e=>setCount(Number(e.target.value))}>{[5,10,Math.min(50,questions.length)].filter((n,i,all)=>n<=questions.length&&all.indexOf(n)===i).map(n=><option key={n} value={n}>{n} questions</option>)}</select></div><div><label htmlFor={policyId}>Barème de la séance quotidienne</label><select id={policyId} value={policy} disabled={busy||loading||!!error} onChange={e=>setPolicy(e.target.value as ScoringPolicy)}><option value="exact">Réponse entièrement correcte</option><option value="partial">Points partiels</option></select></div></div>
  <small>{scoringDescriptions[policy]} Barème personnel, distinct des examens nationaux. Entraînement sans chronomètre ; correction après validation de chaque réponse.</small>
  {loading&&<p>Préparation après chargement de vos données locales…</p>}{error&&<p>La sélection est indisponible tant que vos données locales ne sont pas chargées.</p>}
  {!!selection.length&&<details className="daily-selection"><summary>Voir les {selection.length} questions et les raisons du choix</summary><ol>{selection.map(row=><li key={row.question.id}><strong>{questionTypeLabels[row.question.type]} · {row.question.statement}</strong><p>{row.reason}</p>{row.lastCorrectedAt&&<small>Dernière correction : {new Date(row.lastCorrectedAt).toLocaleString('fr-FR')}.</small>}</li>)}</ol></details>}
  {actionError&&<p className="notice" role="alert">{actionError}</p>}
  <button className="button secondary" disabled={busy||loading||!!error||!selection.length} onClick={()=>void start()}>{busy?'Création de la séance…':'Commencer ma séance quotidienne'}</button>
  {!!active.length&&<div className="daily-resume"><h3>Mes entraînements à reprendre</h3>{active.slice(0,3).map(s=><p key={s.id}><Link to={`/seances/${s.id}`}>{s.questions.length} question(s) · {new Date(s.startedAt).toLocaleString('fr-FR')} · Reprendre</Link></p>)}{active.length>3&&<Link to="/qcm">Voir tous mes entraînements en cours</Link>}</div>}
 </section>;
}
