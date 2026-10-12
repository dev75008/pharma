import { useEffect, useRef, useState } from 'react';

// Code d'intégration publié par VIDAL : aucun accès ni import de sa base.
export function VidalWidget() {
 const [enabled, setEnabled] = useState(false);
 const [status, setStatus] = useState('');
 const host = useRef<HTMLDivElement>(null);
 useEffect(() => {
  if (!enabled) return;
  const script = document.createElement('script');
  script.src = 'https://www.vidal.fr/includes/javascript/vidal/widget/WidgetVidal.js';
  script.async = true;
  let active = true;
  const report = () => { if (active) setStatus('Le module VIDAL ne répond pas. Vous pouvez consulter directement le site VIDAL.'); };
  const timeout = window.setTimeout(report, 12000);
  script.onerror = () => { window.clearTimeout(timeout); report(); };
  script.onload = () => {
   window.clearTimeout(timeout);
   if (active) setStatus('Script chargé. Si le module reste vide, utilisez le lien vers VIDAL.');
  };
  document.head.appendChild(script);
  return () => { active = false; window.clearTimeout(timeout); script.remove(); };
 }, [enabled]);
 return <section className="panel source"><h2>Module de recherche VIDAL</h2><p>Module externe proposé par VIDAL. Connexion internet nécessaire ; les recherches sont traitées par VIDAL. Il ne remplit pas les fiches MEDREVISION et ne fonctionne pas hors ligne.</p><p>Vérification du 12 octobre 2026 : le script renvoyait une erreur 404. Sa disponibilité dépend de VIDAL.</p>{!enabled && <button className="button secondary" onClick={() => { setEnabled(true); setStatus('Chargement du module VIDAL…'); }}>Charger le module VIDAL</button>}<div ref={host} data-role="widget_vidal" data-width="300" data-height="30" data-padding="5"/><p role="status">{status}</p><a href="https://www.vidal.fr/" target="_blank" rel="noopener noreferrer">Consulter VIDAL (nouvel onglet)</a><p><a href="https://www.vidal.fr/module-vidal.html" target="_blank" rel="noopener noreferrer">Documentation officielle du module (nouvel onglet)</a></p></section>;
}
