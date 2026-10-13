# MEDREVISION
Application personnelle de révision DFASM2, React/TypeScript/Vite. Dépôt cible : https://github.com/dev75008/pharma.

## Connecteurs moléculaires — phase 7 partielle

Mise à jour du 13 octobre 2026 : mécanismes ChEMBL du parent déclaré, références et détails des cibles chargés séparément sur demande. Organisme/type/composants conservés dans la langue source, résultat vide explicite et contrôle des identités. Cache IndexedDB v11 pour la relecture hors ligne. Validation : compilation, 105 tests unitaires, 76 scénarios navigateur et vérification réelle mobile. Voir [les mécanismes et leurs limites](docs/phase-7-mecanismes-cibles.md).
Les fiches proposent un chargement PubChem à partir du CID documenté, puis une correspondance ChEMBL par InChIKey complet. Identités contrôlées, ambiguïtés refusées, provenance et cache hors ligne 24 h. Données chimiques distinctes des rubriques cliniques françaises. Mécanismes du parent déclaré et détails des cibles désormais accessibles sur demande, avec descriptions originales, organismes et références ; aucune déduction clinique automatique. Voir docs/phase-7-mecanismes-cibles.md. Voir [la phase 7 et ses limites](docs/phase-7-donnees-moleculaires.md). Validation locale du 13 octobre 2026 : compilation, 98 tests unitaires et 70 scénarios navigateur. Appels réels PubChem/ChEMBL depuis GitHub Pages réussis, puis indisponibilité 503 PubChem observée et signalée.

## Quiz Pharmacorama
Depuis **QCM & entraînement**, le bouton « Afficher le quiz Pharmacorama » charge le quiz original dans un cadre externe. Accès internet requis ; réponses et statistiques restent chez Pharmacorama, sans ajout au score local. Un lien vers le site original reste disponible. Aucun import ou copie de sa banque. Voir [l'intégration et ses limites](docs/quiz-pharmacorama.md). Validation du 13 octobre 2026 : compilation réussie, 81 tests unitaires et 60 scénarios navigateur, plus vérification réelle depuis GitHub Pages et inspection mobile.

## Publications et sources internationales
Les fiches proposent une recherche Europe PMC volontaire, sans clé, de 10 références PubMed au maximum, avec provenance, cache IndexedDB 24 h et lecture hors ligne. Les neuf ressources scientifiques sont distinguées dans le registre ; les bases américaines ne remplacent pas les RCP français. PubChem fournit les propriétés chimiques, ChEMBL la correspondance structurale ; les autres API internationales restent accessibles par lien. Voir [les connecteurs et limites](docs/api-scientifiques.md).

Validation locale de cette extension : compilation réussie, 72 tests Vitest et 50 scénarios Playwright (ordinateur/mobile). Les tests utilisent une réponse bibliographique réelle figée ; l'appel réel Europe PMC depuis l'origine GitHub Pages a retourné HTTP 200 le 12 octobre 2026. Migration IndexedDB v7 : ajout du cache bibliographique, conservation des tables existantes. Les RCP/notices et bibliographies sont téléchargés uniquement sur demande et restent accessibles hors ligne dans les limites de leurs caches. Le lecteur de RCP nettoie le HTML externe avec DOMPurify avant affichage.

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
Les tests E2E utilisent le build de production, y compris le service worker. Le mode hors ligne nécessite une première visite en ligne et la fin du précache ; localhost ou HTTPS requis. Les documents externes sont téléchargés uniquement sur demande et conservés dans les limites du cache. Pour une mise à jour, fermer les onglets de l’ancienne phase 1 puis rouvrir le site ; les versions suivantes disposent d’un avis de mise à jour.

## État actuel : phases 1 à 6
Opérationnels : navigation des pages, recherche globale des modules et médicaments, interface responsive, mode sombre, préférences IndexedDB et objectif hebdomadaire, bibliothèque de 13 molécules / 12 familles, filtres combinables, favoris, historique des 20 dernières molécules consultées, marquage explicite des fiches étudiées, notes personnelles, fiches structurées avec provenance et statut de disponibilité par champ, comparateur de 2 à 4 molécules, impression / enregistrement PDF via le navigateur, précache PWA des contenus statiques et proposition de mise à jour.
Les contenus sont des synthèses documentaires originales partielles, issues de RCP français ; aucune validation médicale indépendante n’est revendiquée. La bibliothèque comporte désormais 479 champs documentés sur 650 (RCP et propriétés structurales PubChem), 13 structures chimiques 2D accessibles hors ligne et cinq points essentiels sourcés par fiche. Les 171 champs restants affichent « À documenter » avec une raison visible ; le détail figure dans [le bilan documentaire](docs/enrichissement-bibliotheque.md). Les catégories de spécialité et système sont un classement pédagogique. La phase 3 ajoute une banque statique de 16 questions de démonstration, six formats, entraînement corrigé immédiatement, examens chronométrés, reprise locale, historique, analyse des erreurs, filtres par classe/format/difficulté/dernière erreur et export CSV des résultats. La phase 4 ajoute 20 flashcards documentaires, création de cartes personnelles, recto/verso, quatre évaluations, répétition espacée SM-2 adaptée, échéances locales, compteur de retards, séances quotidiennes reprises après rechargement, consultation sans planification et suspension/réactivation. La phase 5 ajoute deux dossiers progressifs fictifs (trois étapes chacun), filtres par spécialité, réponses verrouillées après validation, corrections sourcées, reprise locale/hors ligne et bilans persistants. La phase 6 ajoute statistiques unifiées, graphiques/tableaux, planning, recommandations locales expliquées et export/import JSON validé. Voir docs/phase-5-cas-cliniques.md.
Les compteurs des fiches étudiées proviennent du marquage local effectué par l’utilisateur. Consulter une fiche ne signifie pas l’avoir maîtrisée. Les compteurs de corrections proviennent des tentatives enregistrées, blancs inclus. Le taux de réussite compte les réponses entièrement correctes, distinct des points partiels. Le temps affiché correspond aux séances terminées et inclut pauses et onglets fermés ; aucun temps n’est déduit des consultations.

## Architecture
- `src/data` : navigation, registre, 13 synthèses et classes versionnées (`drugs.json`, `classes.json`).
- `src/domain` : interfaces, schémas Zod stricts, recherche, règles de comparaison et péremption documentaire.
- `src/features/library` : bibliothèque, fiches et comparateur.
- `src/features/assessment` : configuration des séances, réponses, corrections, chronomètre et résultats.
- `src/features/cases`, `src/domain/clinicalCases.ts`, `src/storage/clinicalCases.ts` : dossiers versionnés, progression et sauvegarde transactionnelle.
- `src/features/flashcards` : bibliothèque de cartes, création personnelle, séances et bilans.
- `src/domain/spacedRepetition.ts` : validation et SM-2 adapté, calendrier local.
- `src/data/flashcards.ts` : 20 cartes initiales, uniquement à partir de champs documentés.
- `src/data/questions.ts` : banque originale statique de démonstration, versionnée, et objectifs pédagogiques.
- `src/storage` : Dexie/IndexedDB, migrations v1 → v2 → v3 → v4 → v5 → v6 → v7 → v8 → v9 → v10 → v11 sans perte des préférences ; bibliothèque, copies, résultats, tentatives, cartes personnelles, échéances et historique de répétitions.
- `src/App.tsx` : coquille, recherche globale et pages ; `src/PwaUpdate.tsx` : avis de mise à jour.
- `src/styles.css` : Tailwind CSS via plugin Vite et styles responsive, variables du thème.
- `src/test`, `e2e` : tests de composants et navigation navigateur.
Les futurs adaptateurs réseau doivent rester séparés de l’interface. KaTeX affiche les équations des corrections avec trust=false et limites de rendu ; DOMPurify nettoie le HTML/MathML généré. Le module mathématique est chargé à la demande, puis reste disponible hors ligne grâce au précache. Le lecteur de RCP rend le HTML externe après nettoyage DOMPurify avec une liste limitée de balises. Les graphiques Recharts sont chargés à la demande avec tableau équivalent.

## GitHub Pages
Dans le dépôt `dev75008/pharma`, sélectionner Settings → Pages → Source → GitHub Actions. Le workflow vérifie puis déploie les pushes sur `main`. URL attendue après déploiement réussi : https://dev75008.github.io/pharma/.
Le workflow définit `VITE_BASE_PATH=/pharma/`. Les routes par hash fonctionnent sans réécriture serveur. Pour simuler ce chemin localement, copier `.env.example` vers `.env` puis compiler. Domaine personnalisé ou dépôt `dev75008.github.io` : utiliser `/`.
Aucun déploiement n’est affirmé avant retour réussi de GitHub Actions.

## Suite
Phase 2 livrée côté fonctionnalités ; enrichissement et relecture médicale du contenu restent nécessaires. Phase 3 livrée : questions, scores et examens ; banque de démonstration à enrichir et valider. Phase 4 livrée : flashcards et SM-2 adapté. Phase 5 : cas fictifs. Phase 6 : progression, planning, statistiques, sauvegardes. Phase 7 : connecteurs autorisés. Phase 8 : validation globale et publication.

Voir `docs/sources-et-licences.md` et `docs/limites-medicales.md`.

Bilan et procédure documentaire : `docs/bilan-phase-2.md`, `docs/bilan-phase-3.md`, `docs/bilan-phase-4.md`, `docs/repetition-espacee.md`, `docs/evaluation.md` et `docs/mise-a-jour-contenus.md`.

## Catalogue réglementaire connecté

Le module **Catalogue BDPM** recherche les spécialités par nom, CIS ou CIP via l’API indépendante [Medicaments API / Giygas](https://medicaments-api.giygas.dev/), sans clé ni backend. Les fiches locales proposent aussi un chargement des données réglementaires correspondant au CIS exact de leur RCP. Le cache IndexedDB conserve les 50 recherches récentes, disponibles hors ligne ; les copies expirées sont signalées et actualisables. Les compositions, présentations et statuts reçus n’écrasent pas les synthèses cliniques. Indications, contre-indications, posologies et interactions restent à vérifier dans les RCP.

La recherche est déclenchée explicitement : l’adresse IP et les termes sont transmis au service tiers, sans données de révision. Aucune base complète n’est téléchargée automatiquement. Voir [documentation, provenance, conditions d’accès et limites](docs/api-medicaments.md).

## Navigation et lecture documentaire

Les fiches et le catalogue partagent les accès **Fiches de révision / Spécialités et RCP**. La spécialité sélectionnée et sa vue sont conservées dans l’URL, avec retour aux résultats sans nouvelle recherche. La page Catalogue propose les recherches déjà téléchargées. Le complément d’une fiche réutilise une spécialité déjà en cache en conservant sa provenance.

Les endpoints RCP/notice documentés dans le dépôt de Giygas sont intégrés : lecture par rubrique, attribution ANSM, date du document, contenu HTML assaini côté client et cache de 20 documents pour le hors ligne. Les documents de l’API sont conservés durablement par ce service et ne garantissent pas une relecture récente de l’ANSM : le lien vers la version BDPM courante reste disponible. Aucune synthèse clinique n’est remplacée automatiquement. Le rendu documentaire et sa sécurité HTML sont chargés à la demande, indépendamment de KaTeX.

## Suivi et sauvegarde
Tableau de bord et Statistiques utilisent les corrections de QCM/examens et des dossiers enregistrées, sans données simulées. Planning permet de préparer les séances et choisir les thèmes prioritaires. Paramètres propose une sauvegarde JSON versionnée et un import transactionnel par fusion, avec aperçu et refus des conflits. Les notes et réponses sont en clair dans le fichier ; caches externes et scores Pharmacorama exclus. Voir [la phase 6 et les règles de calcul](docs/phase-6-suivi-sauvegarde.md). Validation du 13 octobre 2026 : compilation, 89 tests unitaires, 66 scénarios navigateur ; inspection mobile.
