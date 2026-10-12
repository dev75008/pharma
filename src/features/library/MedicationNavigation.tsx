import { Link } from 'react-router-dom';
import { BookOpen, Database } from 'lucide-react';

export function MedicationNavigation({active}:{active:'bibliotheque'|'catalogue'}) {
 return <div className="medication-navigation" role="group" aria-label="Parcours médicaments"><Link to="/bibliotheque" aria-current={active==='bibliotheque'?'page':undefined}><BookOpen size={17}/> Fiches de révision<small>Comprendre et s’entraîner</small></Link><Link to="/catalogue" aria-current={active==='catalogue'?'page':undefined}><Database size={17}/> Spécialités et RCP<small>Consulter les sources</small></Link></div>;
}
