import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';
import { librarySnapshot } from './db';
export type LibraryState = Awaited<ReturnType<typeof librarySnapshot>>;
export function useLibraryState() {const [data,setData]=useState<LibraryState>({favorites:[],history:[],progress:[],notes:[]});const [error,setError]=useState('');const [loading,setLoading]=useState(true);useEffect(()=>{const sub=liveQuery(librarySnapshot).subscribe({next:value=>{setData(value);setLoading(false);setError('');},error:()=>{setError('Stockage local indisponible. Favoris, historique, notes et progression ne peuvent pas être chargés.');setLoading(false);}});return()=>sub.unsubscribe();},[]);return {data,error,loading};}
