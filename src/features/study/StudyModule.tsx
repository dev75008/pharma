import {lazy,Suspense} from 'react';
const Dashboard=lazy(()=>import('./StudyPages').then(m=>({default:m.StudyDashboard})));
const Statistics=lazy(()=>import('./StudyPages').then(m=>({default:m.StudyStatistics})));
const Planning=lazy(()=>import('./StudyPages').then(m=>({default:m.StudyPlanning})));
const Backup=lazy(()=>import('./BackupPanel').then(m=>({default:m.BackupPanel})));
export function StudyDashboard(){return <Suspense fallback={<p>Chargement du tableau de bord…</p>}><Dashboard/></Suspense>;}
export function StudyStatistics(){return <Suspense fallback={<p>Chargement des statistiques…</p>}><Statistics/></Suspense>;}
export function StudyPlanning(){return <Suspense fallback={<p>Chargement du planning…</p>}><Planning/></Suspense>;}
export function BackupPanel(){return <Suspense fallback={<p>Chargement de la sauvegarde…</p>}><Backup/></Suspense>;}
