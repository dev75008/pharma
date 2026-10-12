# Bilan phase 2 — 12 octobre 2026

## Fonctionnalités opérationnelles
- Interfaces TypeScript médicales et pédagogiques ; schémas Zod stricts pour les médicaments et champs scientifiques.
- 13 fiches initiales sur 12 familles, toutes identifiées comme synthèses documentaires partielles sans relecture médicale indépendante. Valeur absente : À documenter. Provenance par champ : source, URL, rubrique, consultation, mise à jour RCP, vérification et contexte.
- Recherche globale et bibliothèque : DCI, classe, sous-classe, code ATC, mécanisme, cible, indications et autres champs renseignés. Filtres combinables classe/spécialité/système/favoris ; filtres dans l’URL.
- Classes, fiches structurées, sources dépliables, alerte de consultation ancienne après 180 jours.
- Favoris, historique des 20 dernières molécules distinctes, compteur de visites, marquage des fiches étudiées et notes personnelles en texte simple.
- Migration IndexedDB v1 → v2 avec maintien des préférences ; compteurs de fiches étudiées issus du marquage réel.
- Comparaison de 2 à 4 molécules, différences textuelles uniquement pour champs documentés dans toutes les colonnes. Impression / sauvegarde PDF via le navigateur, sources incluses dans le style imprimable.
- Contenu statique précaché, avis de nouvelle version PWA et découpage du bundle en données/application et dépendances.

## Vérifications exécutées
- npm run test : 15 tests réussis (modèles, provenance, recherche, comparaison, migration, stockage et composants).
- npm run build : TypeScript et compilation production réussis.
- npm run test:e2e : 12 tests réussis sur profils Chromium ordinateur et mobile ; routes, filtres, favoris, historique, notes persistantes, marquage, recherche globale, champs sources, fiche inconnue, limite du comparateur, appel d’impression, visibilité des sources en média print et consultation d’une fiche hors ligne.
- Inspection de captures de la bibliothèque, fiche mobile et comparateur. Correction du lien d’évitement pour éviter un artefact de capture pleine page.
- git diff --check : aucune erreur.
Les premiers tests navigateur ont détecté les libellés des sélecteurs et le délai de navigation des cases contrôlées ; corrigés avec libellés explicites et mise à jour immédiate de l’état de sélection.

## Limites et suite
Le contenu est volontairement incomplet : sécurité, chimie, stratégie thérapeutique et points de révision restent largement À documenter. Pas de validation DFASM2 ou médicale indépendante. Aucun connecteur API, synchronisation, sauvegarde import/export ni correction d’examen disponible. L’impression est vérifiée côté navigateur ; les pilotes et fichiers PDF de tous les systèmes ne sont pas certifiés. Safari/Firefox et audit WCAG complet restent à vérifier.
Prochaine phase : QCU/QRM/QROC, corrections déterministes, notation configurable et examens chronométrés ; exemples marqués démonstration avant validation.
Commit : feat: ajouter la bibliothèque pharmacologique et les fiches sourcées (phase 2).
