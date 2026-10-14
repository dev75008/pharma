import type {ScientificField} from '../../domain/models';
import {sources} from '../../data/sources';
export function AbsentScientificValue({field}:{field:Extract<ScientificField,{status:'missing'}>}) {
  return <div className="missing">À documenter<small className="missing-reason">{field.reason}</small>{field.absenceReview&&<>
    <small>Référence examinée le {field.absenceReview.checkedAt} · {field.absenceReview.kind==='uncertain'?'Information non établie':'Donnée non précisée dans la référence'}</small>
    <small>{field.context}</small>
    <details className="provenance"><summary>Référence examinée et limite</summary>{field.absenceReview.evidence.map((e,i)=><div key={i}>
      <a href={e.url} target="_blank" rel="noopener noreferrer">{sources.find(s=>s.id===e.sourceId)?.name??e.sourceId} · Source <span className="sr-only">(nouvel onglet)</span></a>
      <p>{e.locator}</p><p>Consulté le {e.consultedAt} · Source mise à jour : {e.sourceUpdatedAt??'Date inconnue'}</p>
    </div>)}<p>Une référence examinée ne fournit pas nécessairement la donnée. Valeur absente ; aucune conclusion d’absence de risque ou d’effet.</p></details>
    <div className="print-evidence">{field.absenceReview.evidence.map((e,i)=><p key={i}>{e.locator} · {e.url} · Consultation : {e.consultedAt}</p>)}</div>
  </>}</div>;
}
