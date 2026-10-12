import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { documentPath, type DocumentKind } from '../../data/adapters/ansmDocuments';
import { MEDICAMENTS_API } from '../../data/adapters/medicamentsApi';
import { loadDocument, type DocumentResult } from '../../storage/documents';

const SourceContent=lazy(()=>import('./SourceDocumentContent'));
export function DocumentViewer({cis}:{cis:string}) {
 const [result,setResult]=useState<DocumentResult|null>(null);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const [kind,setKind]=useState<DocumentKind>('rcp');const [section,setSection]=useState('');
 const generation=useRef(0);const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{setResult(null);setError('');setSection('');return()=>{generation.current++;};},[cis]);
 async function open(type:DocumentKind,force=false) {
  const request=++generation.current;setBusy(true);setError('');setKind(type);
  if(type!==result?.entry.document.type)setResult(null);
  try {const next=await loadDocument(cis,type,force);if(request===generation.current){setResult(next);if(!force)setSection(next.entry.document.sections[0].id);}}
  catch(e){if(request===generation.current)setError(e instanceof Error?e.message:'Document indisponible.');}
  finally {if(request===generation.current)setBusy(false);}
 }
 const doc=result?.entry.document;
 const current=doc?.sections.find(s=>s.id===section)??doc?.sections[0];
 useEffect(()=>{if(current)heading.current?.focus({preventScroll:true});},[current?.id]);
 return <section className="panel document-reader" aria-label="Documents ANSM"><div className="document-reader-heading"><FileText size={23}/><div><h2>Documents de la spécialité</h2><p>Lire les rubriques du RCP ou la notice patient, avec leur date source.</p></div></div><div className="document-actions"><button className="button secondary" disabled={busy} aria-pressed={!!doc&&kind==='rcp'} onClick={()=>void open('rcp')}>Lire le RCP</button><button className="button secondary" disabled={busy} aria-pressed={!!doc&&kind==='notice'} onClick={()=>void open('notice')}>Lire la notice</button>{doc&&<button className="text-button" disabled={busy} onClick={()=>void open(kind,true)}><RefreshCw size={14}/> Recharger la copie API</button>}</div>{busy&&<p role="status">Chargement du document…</p>}{error&&<p role="alert" className="notice">{error} <a href={`https://base-donnees-publique.medicaments.gouv.fr/medicament/${cis}/extrait`} target="_blank" rel="noopener noreferrer">Consulter la source originale (nouvel onglet)</a></p>}{doc&&result&&<><div className="document-attribution"><strong>{doc.titre}</strong><p>Source : {doc.source} · RCP/notice mis à jour : {doc.miseAJour??'date inconnue'}.</p><p>Copie récupérée le {new Date(result.entry.retrievedAt).toLocaleString('fr-FR')} via Giygas · {result.origin==='cache'?'copie locale':'réponse réseau'}.</p><p>L’API conserve durablement ses documents. Vérifiez la version courante sur la BDPM ; recharger cette copie ne garantit pas une nouvelle consultation de l’ANSM.</p>{(result.stale||result.warning)&&<p className="stale">{result.stale?'Copie locale à revérifier. ':''}{result.warning}</p>}<a href={MEDICAMENTS_API+documentPath(cis,doc.type)} target="_blank" rel="noopener noreferrer">Provenance du document (nouvel onglet)</a></div><label htmlFor={`document-section-${cis}`}>Rubrique à lire</label><select id={`document-section-${cis}`} value={current?.id??''} onChange={e=>setSection(e.target.value)}>{doc.sections.map(s=><option key={s.id} value={s.id}>{s.titre}</option>)}</select>{current&&<div className="source-document-section"><h3 ref={heading} tabIndex={-1}>{current.titre}</h3>{current.contenu?<Suspense fallback={<p>Préparation de la rubrique…</p>}><SourceContent html={current.contenu}/></Suspense>:<p>Cette rubrique ne contient pas de texte dans la réponse source.</p>}</div>}<a className="text-button" href={`https://base-donnees-publique.medicaments.gouv.fr/medicament/${cis}/extrait`} target="_blank" rel="noopener noreferrer">Vérifier le document complet sur la BDPM (nouvel onglet)</a></>}<small className="document-privacy">Chargement à votre demande auprès de Giygas. Jusqu’à 20 documents consultés sont conservés sur cet appareil pour la lecture hors ligne.</small></section>;
}
