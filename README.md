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
Les tests E2E utilisent le build de production, y compris le service worker. Le mode hors ligne nécessite une première visite en ligne et la fin du précache ; localhost ou HTTPS requis. Les RCP externes ne sont pas téléchargés. Pour une mise à jour, fermer les onglets de l’ancienne phase 1 puis rouvrir le site ; les versions suivantes disposent d’un avis de mise à jour.

## État actuel : phases 1 et 2
Opérationnels : navigation des 13 pages, recherche globale des modules et médicaments, interface responsive, mode sombre, préférences IndexedDB et objectif hebdomadaire, bibliothèque de 13 molécules / 12 familles, filtres combinables, favoris, historique des 20 dernières molécules consultées, marquage explicite des fiches étudiées, notes personnelles, fiches structurées avec provenance et statut de disponibilité par champ, comparateur de 2 à 4 molécules, impression / enregistrement PDF via le navigateur, précache PWA des contenus statiques et proposition de mise à jour.
Les contenus sont des synthèses documentaires originales partielles, issues de RCP français ; aucune validation médicale indépendante n’est revendiquée. Les champs non documentés affichent « À documenter ». Les catégories de spécialité et système sont un classement pédagogique. Les questions, examens, flashcards, cas, planning et graphiques attendent les prochaines phases.
Les compteurs des fiches étudiées proviennent du marquage local effectué par l’utilisateur. Consulter une fiche ne signifie pas l’avoir maîtrisée. Aucun temps de révision n’est déduit des consultations.

## Architecture
- `src/data` : navigation, registre, 13 synthèses et classes versionnées (`drugs.json`, `classes.json`).
- `src/domain` : interfaces, schémas Zod stricts, recherche, règles de comparaison et péremption documentaire.
- `src/features/library` : bibliothèque, fiches et comparateur.
- `src/storage` : Dexie/IndexedDB, migration de la version 1 à la version 2 sans perte des préférences ; favoris, historique, progression et notes.
- `src/App.tsx` : coquille, recherche globale et pages ; `src/PwaUpdate.tsx` : avis de mise à jour.
- `src/styles.css` : Tailwind CSS via plugin Vite et styles responsive, variables du thème.
- `src/test`, `e2e` : tests de composants et navigation navigateur.
Les futurs adaptateurs réseau doivent rester séparés de l’interface. Recharts, KaTeX, DOMPurify et les moteurs métier seront ajoutés lorsque utilisés. Aucun contenu HTML externe n’est injecté.

## GitHub Pages
Dans le dépôt `dev75008/pharma`, sélectionner Settings → Pages → Source → GitHub Actions. Le workflow vérifie puis déploie les pushes sur `main`. URL attendue après déploiement réussi : https://dev75008.github.io/pharma/.
Le workflow définit `VITE_BASE_PATH=/pharma/`. Les routes par hash fonctionnent sans réécriture serveur. Pour simuler ce chemin localement, copier `.env.example` vers `.env` puis compiler. Domaine personnalisé ou dépôt `dev75008.github.io` : utiliser `/`.
Aucun déploiement n’est affirmé avant retour réussi de GitHub Actions.

## Suite
Phase 2 livrée côté fonctionnalités ; enrichissement et relecture médicale du contenu restent nécessaires. Phase 3 : questions, scores et examens. Phase 4 : SM-2. Phase 5 : cas fictifs. Phase 6 : progression, planning, statistiques, sauvegardes. Phase 7 : connecteurs autorisés. Phase 8 : validation globale et publication.

Voir `docs/sources-et-licences.md` et `docs/limites-medicales.md`.

Bilan et procédure documentaire : `docs/bilan-phase-2.md` et `docs/mise-a-jour-contenus.md`.
