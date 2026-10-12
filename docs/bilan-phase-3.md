# Bilan phase 3 — 12 octobre 2026

Fonctionnel : six formats d’évaluation, 16 exemples statiques explicitement non validés, provenance et objectifs, filtres par classe/format/difficulté/dernière erreur/molécule, QROC lexical, associations et calcul avec tolérance, correction explicative par proposition, deux barèmes locaux, séances d’entraînement et examens avec échéance absolue, navigation séquentielle, reprise après rechargement, remise à échéance et résultat persistant, analyse des erreurs, export CSV, compteurs réels sur accueil et dashboard. Équations KaTeX à la demande avec DOMPurify et polices WOFF2 précachées. IndexedDB migré en version 3 sans suppression des préférences ou données de bibliothèque.

Vérifications exécutées : 30 tests unitaires/composants réussis ; compilation TypeScript/Vite réussie ; 22 tests navigateur réussis sur ordinateur et mobile. Les tests vérifient les règles de score, les entrées invalides, les blancs, les alias et négations, les limites du calcul, la reprise, l’absence de correction anticipée, le verrouillage d’une réponse, l’idempotence de remise, le délai absolu, le retour sur une copie expirée, l’export CSV, la neutralisation de formules, le rendu MathML sécurisé et l’utilisation des équations/questions hors ligne. Captures de configuration et correction mobile inspectées.

Limites : banque de démonstration non relue médicalement ; pas de barème national ; réponses ouvertes non sémantiques ; pas de dossiers progressifs complets, flashcards SM-2, graphiques détaillés ni sauvegarde JSON réimportable. L’horloge locale n’offre pas de contrôle anti-triche ; durée écoulée incluant les pauses, aucune mesure automatique de l’attention. Les saisies non enregistrées ne sont pas sauvegardées à échéance. Safari/Firefox et audit WCAG complet restent à vérifier.

Commit de phase : feat: ajouter les entraînements et examens chronométrés (phase 3).
Prochain commit proposé : feat: ajouter les flashcards et la répétition espacée SM-2 (phase 4).
