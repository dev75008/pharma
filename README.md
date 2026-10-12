# MEDREVISION
Application personnelle de révision DFASM2, React/TypeScript/Vite. Dépôt cible : https://github.com/dev75008/pharma.

## Installation
Node.js 24 LTS et npm recommandés.
```powershell
cd C:\pharma
npm install
npm run dev
```
Ouvrir l’adresse affichée par Vite.

## Vérification
```powershell
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview
```
Les tests E2E utilisent le build de production, y compris le service worker. Le mode hors ligne nécessite une première visite en ligne et la fin du précache ; localhost ou HTTPS requis.

## Phase 1
Opérationnels : navigation des 13 pages, recherche des modules, interface responsive, mode sombre, préférences IndexedDB et objectif hebdomadaire, erreurs de stockage, registre initial de liens scientifiques, routes inconnues, manifeste et précache PWA, workflow GitHub Pages.
Les pages des phases suivantes affichent leur indisponibilité. Les zéros décrivent l’absence de données ; aucun résultat simulé. Il n’y a pas encore de bibliothèque médicale, quiz, cartes, cas, comparateur, planning ni moteur statistique.

## Architecture
- `src/data` : navigation, registre scientifique ; futurs contenus versionnés et traçables.
- `src/storage` : Dexie/IndexedDB, version 1 des préférences.
- `src/App.tsx` : coquille de navigation et pages initiales.
- `src/styles.css` : Tailwind CSS via plugin Vite et styles responsive, variables du thème.
- `src/test`, `e2e` : tests de composants et navigation navigateur.
Les futurs adaptateurs réseau doivent rester séparés de l’interface. Recharts, KaTeX, DOMPurify et les moteurs métier seront ajoutés lorsque utilisés. Aucun contenu HTML externe n’est injecté.

## GitHub Pages
Dans le dépôt `dev75008/pharma`, sélectionner Settings → Pages → Source → GitHub Actions. Le workflow vérifie puis déploie les pushes sur `main`. URL attendue après déploiement réussi : https://dev75008.github.io/pharma/.
Le workflow définit `VITE_BASE_PATH=/pharma/`. Les routes par hash fonctionnent sans réécriture serveur. Pour simuler ce chemin localement, copier `.env.example` vers `.env` puis compiler. Domaine personnalisé ou dépôt `dev75008.github.io` : utiliser `/`.
Aucun déploiement n’est affirmé avant retour réussi de GitHub Actions.

## Suite
Phase 2 : modèles médicaux, provenance par champ, recherche de médicaments, fiches et favoris. Phase 3 : questions, scores et examens. Phase 4 : SM-2. Phase 5 : cas fictifs. Phase 6 : progression, planning, statistiques, sauvegardes. Phase 7 : connecteurs autorisés. Phase 8 : validation globale et publication.

Voir `docs/sources-et-licences.md` et `docs/limites-medicales.md`.
