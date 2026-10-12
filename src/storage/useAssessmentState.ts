import { useEffect,useState } from 'react';
import { liveQuery } from 'dexie';
import { assessmentSnapshot } from './db';
export function useAssessmentState(){const [data,setData]=useState<Awaited<ReturnType<typeof assessmentSnapshot>>>({drafts:[],results:[],attempts:[]});const [error,setError]=useState('');const [loading,setLoading]=useState(true);useEffect(()=>{const sub=liveQuery(assessmentSnapshot).subscribe({next:data=>{setData(data);setLoading(false);setError('');},error:()=>{setError('Résultats et séances indisponibles : stockage local inaccessible.');setLoading(false);}});return()=>sub.unsubscribe();},[]);return {data,error,loading};}
