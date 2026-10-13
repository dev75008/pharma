import {useEffect,useId,useRef,useState} from 'react';
import {trialFilters,trialsRequest,type TrialFilter} from '../../data/adapters/clinicalTrials';
import {loadTrials,type TrialsResult} from '../../storage/clinicalTrials';

export function ClinicalTrialsExplorer({drugId}:{drugId:string}){
 const [filter,setFilter]=useState<TrialFilter>('all');const [result,setResult]=useState<TrialsResult>();const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const selectId=useId();const generation=useRef(0);useEffect(()=>()=>{generation.current++;},[]);
 const {term}=trialsRequest(drugId,filter);
 async function load(){const token=++generation.current;setBusy(true);setError('');try{const value=await loadTrials(drugId,filter,!!result);if(token===generation.current)setResult(value);}catch(e){if(token===generation.current)setError(e instanceof Error?e.message:'Recherche indisponible.');}finally{if(token===generation.current)setBusy(false);}}
 return <section className="panel source literature-explorer trials-explorer" aria-label="Études et essais cliniques">
  <h2>Études et essais cliniques</h2>
  <p>ClinicalTrials.gov · registre international hébergé aux États-Unis. Recherche dans les interventions : <strong>{term}</strong>. Des associations, comparateurs et synonymes peuvent apparaître ; ce n’est pas une correspondance exacte de molécules.</p>
  <p>Un enregistrement, un statut « terminé » ou la présence de résultats ne prouvent pas l’efficacité. Aucune recommandation française n’en est déduite. Titres et codes conservés dans la langue source ; aucun protocole ou résultat détaillé importé.</p>
  <div className="document-actions"><label htmlFor={selectId}>Statut déclaré</label><select id={selectId} value={filter} disabled={busy} onChange={e=>{setFilter(e.target.value as TrialFilter);setResult(undefined);setError('');}}>{Object.entries(trialFilters).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button className="button secondary" disabled={busy} onClick={()=>void load()}>{busy?'Recherche des études…':result?'Actualiser les études':'Rechercher les études'}</button></div>
  <small>Chargement volontaire sans clé : le nom anglais, le filtre et votre adresse IP sont transmis à ClinicalTrials.gov. Cache local 1 h, 30 recherches ; les copies ne garantissent pas les statuts actuels.</small>
  {error&&<p className="notice" role="alert">{error}</p>}
  {result&&<>
   <p role="status">{result.entry.totalCount} études trouvées · {result.entry.studies.length} affichées{result.entry.hasMore?' · liste limitée à la première page':''}. Tri par dernière publication de mise à jour, du plus récent au plus ancien ; aucune sélection de qualité.</p>
   <p>Téléchargement : {new Date(result.entry.retrievedAt).toLocaleString('fr-FR')}. Traitement de la base annoncé par l’API : <strong>{result.entry.version.dataTimestamp}</strong> (valeur originale{/(Z|[+-]\d{2}:\d{2})$/.test(result.entry.version.dataTimestamp)?'':' ; fuseau non précisé'}). API {result.entry.version.apiVersion}.</p>
   {result.warning&&<p className="notice">{result.warning}</p>}{result.stale&&<p className="stale">Copie ancienne : actualisez la source avant de vous fier au statut.</p>}
   <ul>{result.entry.studies.map(study=>{const {identificationModule:id,statusModule:status,designModule:design}=study.protocolSection;return <li key={id.nctId}><a href={`https://clinicaltrials.gov/study/${id.nctId}`} target="_blank" rel="noopener noreferrer">{id.briefTitle} (nouvel onglet)</a><p>{id.nctId} · Statut : <strong>{status?.overallStatus??'À documenter'}</strong> · Type : {design?.studyType??'À documenter'}</p><p>Phase : {design?.phases?.length?design.phases.join(', '):'À documenter'} · Mise à jour publiée du dossier : {status?.lastUpdatePostDateStruct?.date??'À documenter'}</p><small>Résultats disponibles dans le registre : {study.hasResults===true?'oui, selon la source':study.hasResults===false?'non signalés par la source':'À documenter'}. Cette indication n’est pas une interprétation des résultats.</small></li>;})}</ul>
   {!result.entry.studies.length&&<p>Aucune étude retournée pour cette recherche. Cela ne démontre pas l’absence d’études sur cette molécule.</p>}
   <p>Source : ClinicalTrials.gov · sélection de champs sans modification des valeurs. <a href={result.entry.url} target="_blank" rel="noopener noreferrer">Réponse API de la recherche (nouvel onglet)</a> · <a href={result.entry.versionUrl} target="_blank" rel="noopener noreferrer">Version et traitement de la base (nouvel onglet)</a>.</p>
  </>}
  <p><a href="https://clinicaltrials.gov/about-site/terms-conditions" target="_blank" rel="noopener noreferrer">Conditions de réutilisation ClinicalTrials.gov (nouvel onglet)</a>. Informations déclarées par les responsables des études ; consultez les dossiers originaux pour les données actuelles.</p>
 </section>;
}
