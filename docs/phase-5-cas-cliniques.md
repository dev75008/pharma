# Phase 5 — dossiers progressifs

## Fonctionnalités opérationnelles

Deux dossiers statiques, trois étapes chacun, patients entièrement fictifs : metformine/fonction rénale (endocrinologie et néphrologie), ramipril/interactions/surveillance (cardiologie et néphrologie). Antécédents, traitements, symptômes et constantes structurés ; résultats biologiques inventés explicitement signalés. Aucune donnée de patient réel.

Liste filtrable par spécialité avec filtre dans l'URL, démarrage de nouvelles tentatives indépendantes, reprise des séances en cours, historique des bilans. Routes hash `/cas-cliniques` et `/dossiers/:id` compatibles GitHub Pages. Une question par étape : réponse sauvegardable sans validation, validation définitive, correction détaillée réutilisant le moteur existant, progression explicite après correction. Le score tout ou rien est personnel, sans barème national revendiqué. Une mauvaise réponse ne bloque pas la découverte de la suite.

Les informations des étapes suivantes ne sont pas rendues dans l'interface avant progression. Les données restent accessibles techniquement dans le navigateur : ce masquage pédagogique n'est pas un dispositif d'examen sécurisé. Après terminaison, le bilan conserve toutes les réponses et propose un filtre des erreurs. Les scores sont recalculés avec le moteur déterministe existant, à partir du contenu sauvegardé.

IndexedDB version 8 ajoute `caseSessions` sans supprimer les tables précédentes. Chaque séance contient son dossier complet versionné, ses questions, sources, réponses, étapes validées, dates et compteur de révision. Une transaction vérifie la révision avant chaque modification : un second onglet obsolète ne peut écraser une réponse, une validation ou une terminaison. En cas de conflit, recharger la séance. Une adresse inconnue ou un enregistrement incompatible affiche une erreur explicite. Le temps écoulé du bilan inclut pauses et fermetures.

Le module est chargé à la demande et précaché par la PWA, ce qui permet la création et la poursuite de dossiers hors ligne après une première visite et la fin du précache. Un aperçu du tableau de bord affiche les nombres réels de dossiers terminés et à reprendre. Les dossiers restent comptés séparément des entraînements et examens ; l'agrégation des statistiques relève de la phase 6.

## Provenance et limites

Questions originales de démonstration, sans validation médicale ou universitaire indépendante. Certaines questions réemploient la banque existante avec de nouveaux identifiants de dossier ; aucune génération automatique à partir d'une API. Les nouvelles questions se limitent à des points documentés au RCP, sans posologie ou substitution individuelle.

RCP consultés à nouveau le 12 octobre 2026 :

- METFORMINE BGR 500 mg : https://base-donnees-publique.medicaments.gouv.fr/medicament/69916198/extrait ; rubriques 4.2–4.4 et 5.1–5.2, date du texte 26 mars 2025.
- RAMIPRIL BIOGARAN 5 mg : https://base-donnees-publique.medicaments.gouv.fr/medicament/61599041/extrait ; rubriques 4.4–4.5 et 5.1, provenance par question issue des champs documentaires.

Les dossiers n'incluent pas de diagnostic, de prescription réelle ou de branchement simulant la réponse physiologique à un choix de traitement. L'étudiant doit comparer les explications aux sources originales. Les vignettes ne prétendent pas couvrir tout le DFASM2.

## Validation et suite

Tests du schéma, progression séquentielle, réponses futures interdites, verrouillage, calcul du score, chronologie, sauvegarde et réouverture, concurrence entre onglets, terminaison unique. Playwright vérifie le parcours complet, filtres, bilan persistant, erreur d'adresse et poursuite hors ligne sur ordinateur et mobile. Compilation TypeScript/Vite et suite existante à exécuter avant publication.

Résultat local du 12 octobre 2026 : compilation réussie, 79 tests Vitest et 56 scénarios Playwright réussis. Vue mobile de la liste inspectée à 390 px ; absence de débordement vérifiée dans les parcours. Module chargé dans un chunk séparé d'environ 20 Ko, précaché pour le hors ligne.

Suite prévue : phase 6, statistiques unifiées, planning, recommandations locales, export/import JSON versionnés. Extension des dossiers après relecture documentaire ; un mode d'examen différant la correction n'est pas implémenté pour les dossiers.

Commit : `feat: add persistent progressive clinical case sessions`.
