# Bilan phase 4 — 12 octobre 2026

## Opérationnel
20 cartes documentaires sur les 12 familles et 6 types demandés ; champs manquants exclus sans supposition. Création de cartes personnelles en texte simple, avec référence HTTPS facultative et statut non vérifié. Recto/verso, provenance et liens de fiches, filtres par classe/type/concept/molécule. Séance quotidienne ordonnée par retard puis échéance puis nouvelles cartes. Quatre évaluations et SM-2 adapté, prochaines dates affichées, consolidation en fin de file pour À revoir/Difficile sans deuxième avance d’intervalle. Pause/reprise et bilan persistant ; consultation sans modifier les échéances ; suspension/réactivation conservant l’historique. Résumé des échéances sur accueil/dashboard ; durée des séances de cartes terminées intégrée au temps réel écoulé.
Stockage IndexedDB v4 : migration conservant préférences, bibliothèque et résultats ; transactions de notation, protection des doubles soumissions et conflits de séances concurrentes.

## Vérifications exécutées
44 tests unitaires/composants réussis : modèles, provenance, six types, intervalles 1/6/multiplication, arrondi, oubli, facteur minimum, limite technique, calendrier, ordre de priorité, migration v3 → v4, transactions, consultation, suspension, reprise et contenu personnel échappé ; inclut les contrôles des phases précédentes.
Compilation TypeScript/Vite réussie. Tests navigateur : 28 cas réussis au premier passage ; deux cas bloqués par une différence de ponctuation du sélecteur « Rappel dans cette séance » ont été corrigés puis exécutés avec succès sur ordinateur et mobile. Le workflow GitHub réexécute les 30 cas avant publication. Ces parcours couvrent recto/verso, sources, note persistante, reprise d’un rappel sans double planification, création personnelle, consultation, suspension, réactivation, hors ligne et régressions de navigation/bibliothèque/examens.
Captures du verso sur ordinateur et mobile et page flashcards mobile inspectées. git diff --check réussi.

## Limites et suite
Cartes documentaires sans relecture médicale indépendante. SM-2 adapté à quatre notes ; aide au travail, sans garantie de rétention. Échéances et durées dépendent du calendrier/horloge locale ; pauses comprises. Modification/suppression des cartes personnelles et sauvegarde JSON réimportable restent à ajouter. Pas encore de dossiers progressifs complets ni de graphiques détaillés ; pas de sync multiappareil. Safari/Firefox et audit WCAG complet restent à vérifier.
Commit de phase : feat: ajouter les flashcards et la répétition espacée SM-2 (phase 4).
Prochain commit proposé : feat: ajouter les dossiers cliniques progressifs fictifs (phase 5).
