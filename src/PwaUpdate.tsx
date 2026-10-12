import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
export function PwaUpdate() {
 const [error,setError]=useState('');
 const { needRefresh:[needRefresh,setNeedRefresh], updateServiceWorker }=useRegisterSW({onRegisterError:()=>setError('Le téléchargement hors ligne n’a pas pu être activé dans ce navigateur.')});
 if(!needRefresh&&!error)return null;
 return <aside className="pwa-update panel" aria-label="Mise à jour de l’application"><p role="status">{error||'Nouvelle version disponible. Enregistrez vos notes avant de l’appliquer.'}</p>{needRefresh&&<button className="button secondary" onClick={()=>void updateServiceWorker(true).catch(()=>setError('Mise à jour impossible. Réessayez en ligne.'))}>Actualiser l’application</button>}<button className="text-button" onClick={()=>{setNeedRefresh(false);setError('');}}>Plus tard</button></aside>;
}
