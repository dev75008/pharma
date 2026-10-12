import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Database, RefreshCw } from 'lucide-react';
import { drugs } from '../../data/drugs';
import { fieldText } from '../../domain/library';
import { catalogRequest, MedicamentsApiError, type RegulatoryDrug } from '../../data/adapters/medicamentsApi';
import { loadCatalog, type CatalogResult } from '../../storage/catalog';

const formatDate=(date:string)=>new Date(date).toLocaleString('fr-FR');
const available=(value:string|null|undefined)=>value?.trim()?value:'À documenter';
export function drugCis(drugId:string) {
 const drug=drugs.find(d=>d.id===drugId);
 return drug?.fields.dci.evidence.find(e=>e.sourceId==='bdpm')?.url.match(/\/medicament\/(\d{8})\//)?.[1]??null;
}
function useCatalog() {
 const [result,setResult]=useState<CatalogResult|null>(null);
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const [retryAt,setRetryAt]=useState<number|null>(null);const generation=useRef(0);
 useEffect(()=>()=>{generation.current++;},[]);
 async function search(input:string,force=false) {
  const id=++generation.current;setBusy(true);setError('');setResult(null);setRetryAt(null);
  try {const next=await loadCatalog(input,force);if(id===generation.current)setResult(next);}
  catch(e){if(id===generation.current){setError(e instanceof Error?e.message:'Recherche impossible.');if(e instanceof MedicamentsApiError)setRetryAt(e.retryAt);}}
  finally{if(id===generation.current)setBusy(false);}
 }
 return {result,error,busy,retryAt,search};
}
function Provenance({result}:{result:CatalogResult}) {
 const entry=result.entry;
 const sourceOld=entry.sourceSyncedAt!==null&&Date.now()-Date.parse(entry.sourceSyncedAt)>48*3600000;
 return <div className="catalog-provenance"><p><strong>Source : Base de données publique des médicaments, via l’API indépendante Giygas.</strong> Données réglementaires retransmises ; ce service n’est pas l’API officielle du ministère.</p><p>Récupération : {formatDate(entry.retrievedAt)} · {result.origin==='cache'?'Copie locale':'Réponse réseau'} · Synchronisation annoncée par l’API : {entry.sourceSyncedAt?formatDate(entry.sourceSyncedAt):'date inconnue'}.</p><p>La synchronisation de l’API n’est pas la date de mise à jour du RCP ni de chaque fichier source.</p>{(result.stale||sourceOld)&&<p className="stale">{result.stale?'Copie à actualiser. ':''}{sourceOld?'Synchronisation annoncée datant de plus de 48 heures.':''}</p>}{result.warning&&<p className="notice">{result.warning}</p>}<a href={`https://medicaments-api.giygas.dev${entry.key}`} target="_blank" rel="noopener noreferrer">Voir la réponse source (nouvel onglet)</a></div>;
}
export function RegulatoryRecord({record}:{record:RegulatoryDrug}) {
 const related=drugs.find(d=>drugCis(d.id)===String(record.cis));
 return <article className="panel regulatory-record"><h2>{record.elementPharmaceutique}</h2><p className="pill">CIS {record.cis}</p><dl>
  {[['Forme pharmaceutique',record.formePharmaceutique],['Voies',record.voiesAdministration?.join(' ; ')],['Autorisation',record.statusAutorisation],['Commercialisation',record.etatComercialisation],['Date d’AMM',record.dateAMM],['Titulaire',record.titulaire],['Procédure',record.typeProcedure],['Surveillance renforcée',record.surveillanceRenforcee]].map(([label,value])=><div className="field-row" key={label}><dt>{label}</dt><dd>{available(value)}</dd></div>)}
 </dl><h3>Composition déclarée</h3>{record.composition?.length?<ul>{record.composition.map((c,i)=><li key={i}><strong>{c.denominationSubstance}</strong> · {available(c.dosage)} · référence : {available(c.referenceDosage)} · élément : {available(c.elementPharmaceutique)} · nature : {available(c.natureComposant)}</li>)}</ul>:<p className="missing">À documenter : aucune composition fournie par cette réponse.</p>}
 <h3>Conditions de prescription et délivrance</h3>{record.conditions?.length?<ul>{record.conditions.map((c,i)=><li key={i}>{c}</li>)}</ul>:<p className="missing">À documenter : absence d’information ne signifie pas vente libre.</p>}
 <h3>Présentations déclarées</h3>{record.presentation?.length?<div className="catalog-presentations">{record.presentation.map((p,i)=><div key={i}><strong>{p.libelle}</strong><p>CIP7 : {p.cip7??'À documenter'} · CIP13 : {p.cip13??'À documenter'}</p><p>{available(p.statusAdministratif)} · {available(p.etatComercialisation)}</p><p>Date de déclaration : {available(p.dateDeclaration)} · remboursement déclaré : {available(p.tauxRemboursement)}</p><p>Prix hors honoraires déclaré : {p.prix!=null&&p.prix>0?`${p.prix.toLocaleString('fr-FR')} €`:'Non renseigné'}.</p></div>)}</div>:<p className="missing">À documenter : aucune présentation fournie.</p>}
 <h3>Groupes génériques déclarés</h3>{record.generiques?.length?<ul>{record.generiques.map((g,i)=><li key={i}>{g.libelle} · groupe {g.group} · {available(g.type)}</li>)}</ul>:<p className="missing">Aucun groupe renseigné dans cette réponse ; ce n’est pas une preuve d’absence de générique.</p>}
 <div className="drug-actions"><a className="button secondary" href={`https://base-donnees-publique.medicaments.gouv.fr/medicament/${record.cis}/extrait`} target="_blank" rel="noopener noreferrer">Consulter la BDPM et le RCP (nouvel onglet)</a>{related&&<Link className="button secondary" to={`/medicaments/${related.id}`}>Fiche de révision : {fieldText(related.fields.dci)}</Link>}</div></article>;
}
export function RegulatoryCatalog() {
 const [params,setParams]=useSearchParams();const initial=params.get('q')??'';
 const [input,setInput]=useState(initial);const [submitted,setSubmitted]=useState('');const [limit,setLimit]=useState(20);
 const {result,error,busy,retryAt,search}=useCatalog();const [selected,setSelected]=useState<number|null>(null);
 useEffect(()=>{setInput(initial);setSelected(null);setLimit(20);if(initial){setSubmitted(initial);void search(initial);}},[initial]);
 function submit(e:FormEvent){e.preventDefault();setSelected(null);setLimit(20);try{catalogRequest(input);}catch(e){void search(input);return;}if(input===initial){setSubmitted(input);void search(input);}else setParams({q:input});}
 const chosen=result?.entry.records.find(r=>r.cis===selected);
 return <><div className="page-heading"><span className="eyebrow">SPÉCIALITÉS FRANÇAISES</span><h1>Catalogue BDPM</h1><p>Recherche par nom de spécialité, CIS ou CIP. Les fiches de révision restent accessibles dans la bibliothèque.</p></div><div className="notice"><Database/><p>Le catalogue renseigne composition, présentations, autorisation et délivrance. Les indications, interactions et posologies cliniques doivent être vérifiées dans le RCP. La recherche de noms de substances dépend de leur présence dans le nom de la spécialité.</p></div><form className="panel catalog-search" onSubmit={submit}><label htmlFor="catalog-query">Nom, CIS ou CIP</label><div><input id="catalog-query" type="search" maxLength={50} value={input} onChange={e=>setInput(e.target.value)} placeholder="Paracétamol 500, 60524826…"/><button className="button" disabled={busy} type="submit">{busy?'Recherche…':'Rechercher dans la BDPM'}</button></div><small>Connexion à un service tiers lors de la recherche : votre requête et votre adresse IP lui sont transmises. Aucun compte ni résultat de révision n’est envoyé.</small></form>{error&&<p role="alert" className="notice">{error}{retryAt&&` Nouvel essai après ${formatDate(new Date(retryAt).toISOString())}.`}</p>}{result&&<><Provenance result={result}/><div className="catalog-tools"><p role="status">{result.entry.records.length} spécialité(s) trouvée(s){result.entry.records.length===250?' · Limite de 250 atteinte : précisez la recherche.':''}</p><button className="button secondary" disabled={busy} onClick={()=>void search(submitted,true)}><RefreshCw size={16}/> Actualiser depuis l’API</button></div>{chosen?<><button className="text-button" onClick={()=>setSelected(null)}>Retour aux résultats</button><RegulatoryRecord record={chosen}/></>:<><div className="drug-grid">{result.entry.records.slice(0,limit).map(r=><article className="panel drug-card" key={r.cis}><span className="pill">CIS {r.cis}</span><h2>{r.elementPharmaceutique}</h2><p>{available(r.formePharmaceutique)} · {r.voiesAdministration?.join(' ; ')||'Voies à documenter'}</p><small>{available(r.etatComercialisation)}</small><button className="button secondary" onClick={()=>setSelected(r.cis)}>Voir la spécialité <ArrowRight size={16}/><span className="sr-only"> {r.elementPharmaceutique}</span></button></article>)}</div>{result.entry.records.length>limit&&<button className="button secondary" onClick={()=>setLimit(v=>v+20)}>Afficher 20 résultats supplémentaires</button>}{!result.entry.records.length&&<p>Aucun résultat. Essayez un nom de spécialité ou un code CIS/CIP.</p>}</>}</>}<p className="catalog-footnote">Les 50 recherches les plus récentes sont conservées sur cet appareil. Les copies expirées sont signalées et restent consultables hors ligne. Une réinitialisation du navigateur peut les supprimer.</p></>;
}
export function RegulatorySupplement({cis}:{cis:string}) {
 const {result,error,busy,retryAt,search}=useCatalog();
 return <section className="regulatory-supplement"><div className="panel source"><h2>Données réglementaires de la spécialité</h2><p>CIS {cis} · Actualisez sa composition, ses présentations et son statut via la BDPM retransmise par l’API Giygas. Les synthèses cliniques ci-dessus conservent leur provenance et leur version.</p><p>Lors du chargement, votre adresse IP et ce code CIS sont transmis au service tiers. Aucun identifiant ni donnée de révision n’est envoyé.</p><button className="button secondary" disabled={busy} onClick={()=>void search(cis,!!result)}>{busy?'Chargement…':result?'Actualiser cette spécialité':'Charger les données BDPM'}<RefreshCw size={16}/></button>{error&&<p role="alert">{error}{retryAt&&` Réessayer après ${formatDate(new Date(retryAt).toISOString())}.`}</p>}</div>{result&&<><Provenance result={result}/>{result.entry.records[0]&&<RegulatoryRecord record={result.entry.records[0]}/>}</>}</section>;
}
