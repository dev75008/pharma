import {useEffect,useState} from 'react';
import {liveQuery} from 'dexie';
import {emptyStudyData} from '../../domain/study';
import {studySnapshot} from '../../storage/study';
import {useToday} from '../../storage/useFlashcardState';
export function useStudy(){const [data,setData]=useState(emptyStudyData);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const today=useToday();useEffect(()=>{const sub=liveQuery(studySnapshot).subscribe({next:value=>{setData(value);setLoading(false);setError('');},error:()=>{setLoading(false);setError('Les données locales ne peuvent pas être chargées.');}});return()=>sub.unsubscribe();},[]);return {data,loading,error,today};}
