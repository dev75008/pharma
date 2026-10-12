import {lazy,Suspense} from 'react';
const Home=lazy(()=>import('./ClinicalCases').then(m=>({default:m.ClinicalCasesHome})));
const Route=lazy(()=>import('./ClinicalCases').then(m=>({default:m.ClinicalCaseRoute})));
const Overview=lazy(()=>import('./ClinicalCases').then(m=>({default:m.CaseOverview})));
export function ClinicalCasesHome(){return <Suspense fallback={<p role="status">Chargement des cas cliniques…</p>}><Home/></Suspense>;}
export function ClinicalCaseRoute(){return <Suspense fallback={<p role="status">Chargement du dossier…</p>}><Route/></Suspense>;}
export function CaseOverview(){return <Suspense fallback={<p>Chargement de l’historique des dossiers…</p>}><Overview/></Suspense>;}
