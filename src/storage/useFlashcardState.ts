import { useEffect,useState } from 'react';
import { liveQuery } from 'dexie';
import { flashcards } from '../data/flashcards';
import { flashcardSnapshot } from './flashcards';
import { localDate } from '../domain/spacedRepetition';
export function useToday(){const [today,setToday]=useState(localDate());useEffect(()=>{const update=()=>setToday(localDate());const timer=window.setInterval(update,30000);window.addEventListener('focus',update);return()=>{window.clearInterval(timer);window.removeEventListener('focus',update);};},[]);return today;}
export function useFlashcardState(){const [data,setData]=useState<Awaited<ReturnType<typeof flashcardSnapshot>>>({customCards:[],schedules:[],sessions:[],reviews:[]});const [loading,setLoading]=useState(true);const [error,setError]=useState('');useEffect(()=>{const sub=liveQuery(flashcardSnapshot).subscribe({next:value=>{setData(value);setLoading(false);setError('');},error:()=>{setError('Les flashcards ne peuvent pas être enregistrées ou chargées dans ce navigateur.');setLoading(false);}});return()=>sub.unsubscribe();},[]);return {data,cards:[...flashcards,...data.customCards],loading,error,today:useToday()};}
