# MEDREVISION

Plateforme personnelle de révision DFASM2 en français, sans backend obligatoire. Site : https://dev75008.github.io/pharma/ · dépôt : https://github.com/dev75008/pharma.

Version technique du 14 octobre 2026 : **15 fiches / 12 familles, 56 questions, 52 flashcards et 10 dossiers fictifs**. 598 champs documentés sur 750 ; les 168 autres restent « À documenter ». La page Sources expose un bilan filtrable et exportable des rubriques et besoins de relecture. Le cahier des charges documentaire et la validation médicale indépendante ne sont pas intégralement achevés. [Bilan des huit phases, tests et limites](docs/livraison.md), [extension et procédure de relecture](docs/extension-bibliotheque-et-relecture.md).

## Installation et lancement

Node.js 24 LTS et npm recommandés.

```powershell
cd C:\pharma
npm install
npm run dev
```

Ouvrir l’adresse affichée par Vite. Aucun compte ni clé privée nécessaire. Les appels scientifiques externes sont déclenchés volontairement ; le site reste utilisable avec ses données locales sans ces services.

## Vérification

```powershell
npm run test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
npm run test:compat
npm run release:check
npm run preview
```

Sous Linux : `npx playwright install --with-deps chromium firefox webkit`. Les tests utilisent le build de production et le service worker. Les avertissements de taille/eval de la dépendance 3D sont [documentés](docs/structures-3d.md).

## Fonctionnalités

- Bibliothèque : recherche par nom, classe, mécanisme, indication et cible ; filtres combinables, favoris, historique, marquage étudié et notes personnelles.
- Classes : pages de famille avec mécanismes sourcés par molécule, sécurité, objectifs, progression réelle et liens filtrés vers les exercices, dossiers, cartes et comparateur. Recherche globale des familles, sous-classes extensibles et routes inconnues gérées.
- Fiches : 50 champs, disponibilité, contexte molécule/spécialité, provenance, dates et liens. Comparateur 2–4 molécules et PDF par impression du navigateur.
- Évaluation : six formats, filtres par classe/spécialité/objectif, mélange optionnel, entraînement corrigé après validation, examens chronométrés, reprise de l’ordre et des réponses, corrections détaillées, résultats et CSV. Banque de démonstration sans validation indépendante.
- Flashcards : six types, cartes personnelles, quatre évaluations, SM-2 adapté, échéances, rappels et suspension.
- Dossiers : sept patients fictifs, six dossiers de trois étapes et un transversal de cinq étapes, informations progressives, réponses verrouillées, sources, reprise et bilans.
- Suivi : statistiques réelles, graphiques avec tableaux, objectifs, planning, thèmes et recommandations. Séance quotidienne de 5, 10 ou davantage de questions selon la banque, plafonnée à 50, avec prévisualisation et barème configurable.
- Sauvegarde : export/import JSON personnel validé et transactionnel, aperçu avant import, collisions gérées et CSV. Caches scientifiques séparés.
- Interface : mobile, clair/sombre, navigation clavier, lien d’évitement, menu avec gestion du focus, PWA et avis de mise à jour.

## Sources

Catalogue et RCP/notices via l’API indépendante Giygas ; propriétés et conformères 3D PubChem ; identités structurales, mécanismes et cibles ChEMBL ; bibliographie Europe PMC ; correspondances exactes RxNorm ; études ClinicalTrials.gov ; métadonnées SPL américaines OpenFDA avec liens DailyMed. Provenance, dates, cache borné et erreurs contrôlés. Aucun remplissage automatique des champs cliniques français.

Pharmacorama : quiz original sur demande, sans copie des questions ou scores. VIDAL et Thériaque : accès originaux, sans import de leurs bases. DailyMed : lien, CORS bloquant observé. Les autres références sont distinguées dans le registre ; aucun endpoint ou droit d’accès inventé.

[Sources/licences](docs/sources-et-licences.md) · [Enrichissement](docs/enrichissement-documentaire-14-octobre.md) · [OpenFDA](docs/openfda.md) · [API](docs/api-scientifiques.md) · [3D](docs/structures-3d.md) · [RxNorm](docs/phase-7-rxnorm.md) · [Études](docs/phase-7-essais-cliniques.md) · [Pharmacorama](docs/quiz-pharmacorama.md).

Le complément [classes et stratégie](docs/classes-et-strategie.md) décrit la courte synthèse RCP/HAS de la metformine et les règles de navigation ; aucun algorithme clinique ou contenu HAS intégral reproduit.

## Ajouter des contenus autorisés

Paquets JSON : fiches, classes, spécialités, systèmes, questions, dossiers et cartes. Paramètres permet de vérifier un fichier et télécharger le paquet vérifié ; l’ajout au catalogue nécessite une compilation/publication.

```powershell
npm run content:validate -- exemples-ou-donnees.json
npm run content:import -- exemples-ou-donnees.json
npm run test
npm run build
```

Exemple : `examples/contenus-exemple.json`. L’import remplace le paquet complémentaire, jamais le catalogue initial ni la progression. [Schéma, droits et procédure](docs/importation-contenus.md). La compilation revérifie les données ; un import ne peut revendiquer une validation indépendante.

## Architecture et déploiement

`src/domain` : modèles, schémas, recherche, scores, mélange d’exercices, SM-2, dossiers, statistiques, sélection quotidienne et imports/exports. `src/data` : contenus versionnés, registre et adaptateurs. `src/storage` : Dexie/IndexedDB, migrations v1–v15, progression et caches distincts. `src/features` : modules pédagogiques ; graphiques, équations, HTML et 3D chargés séparément. `scripts` : contrôles, import et révisions documentaires ; `e2e` : parcours et fixtures documentées.

GitHub Settings → Pages → Source → GitHub Actions. Chaque push sur main déclenche tests, compatibilité, compilation avec `VITE_BASE_PATH=/pharma/`, contrôle de livraison et publication. Pull requests vérifiées sans déploiement. Routes HashRouter ; domaine personnalisé : base `/`. `.env.example` ne contient aucun secret.

Une première visite en ligne et la fin du précache sont nécessaires au hors ligne. Documents/API : copies déjà téléchargées seulement, dans les limites du cache. Cliquer sur **Actualiser l’application** lorsqu’une version est proposée ; la progression reste dans IndexedDB.

## Limites

Synthèses partielles et exercices de démonstration, sans validation médicale indépendante ou certification universitaire. Pas de diagnostic ou prescription pour de vrais patients. Barèmes personnels distincts des examens nationaux ; QROC corrigées par mots-clés avec limites visibles.

Pas de synchronisation entre appareils. Réinitialiser le navigateur peut supprimer IndexedDB : exporter régulièrement sa sauvegarde. Temps affiché : séances terminées, pauses comprises ; consultation d’une fiche distincte de sa maîtrise. Les tests axe/WebKit ne certifient ni une conformité WCAG complète ni chaque appareil Safari réel.

[Limites médicales](docs/limites-medicales.md) · [Accessibilité](docs/accessibilite.md) · [SM-2](docs/repetition-espacee.md) · [Séance quotidienne](docs/entrainement-quotidien.md) · [Mises à jour](docs/mise-a-jour-contenus.md). Bilans historiques conservés dans docs avec leurs dates et résultats d’alors.
