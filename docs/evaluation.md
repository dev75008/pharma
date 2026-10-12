# Moteur d’autoévaluation — phase 3

## Contenus
16 questions statiques originales de démonstration, toutes marquées demo, avec provenance et objectifs. Elles ne sont ni validées DFASM2 ni générées automatiquement par un moteur en ligne. Formats : QCU, QRM, vrai/faux, QROC, associations et calcul de pharmacocinétique ; un énoncé utilise une situation fictive de lecture de RCP. Les dossiers progressifs et cas transversaux complets restent en phase 5.
La majorité des sources est reprise des champs consultés des fiches, sans reproduction de monographies. L’exercice de demi-vie utilise un modèle mathématique fictif et la définition IUPAC, sans attribuer ses paramètres à un médicament réel.

## Barèmes locaux
Chaque question vaut au maximum 1 point. Aucune note négative ; un blanc vaut 0. Choix du barème fixé lors de la création et conservé dans la copie.
- Tout ou rien : réponse entièrement correcte = 1 ; sinon 0.
- Crédit partiel : QRM = max(0, 1 − (omissions + choix erronés) / nombre de propositions). Association = proportion d’items corrects. QROC = proportion de concepts reconnus. QCU/vrai-faux et calcul = 0 ou 1.
Ces barèmes ne reproduisent pas une notation officielle. Le taux de réussite du dashboard est la proportion de corrections entièrement correctes ; le pourcentage de points d’une séance peut différer avec le crédit partiel.

## Réponses ouvertes et calcul
QROC : normalisation des accents, casse et ponctuation, recherche d’alias comme mots entiers. Une négation explicite ne/pas/non/sans/aucun/jamais suspend la concordance positive (score 0 par convention), avec invitation à comparer soi-même au corrigé. Faux positifs et faux négatifs demeurent possibles ; aucune compréhension sémantique ni correction IA. Les alias attendus sont affichés après validation.
Calcul : chaîne numérique stricte, virgule ou point décimal, comparaison à une valeur et une tolérance explicites. L’unité est indiquée dans le champ ; ne pas la saisir. KaTeX est chargé uniquement pour les corrections dotées d’une équation et son rendu est nettoyé avec DOMPurify ; les notes et réponses sont du texte simple.

## Persistance et échéance
IndexedDB v3 ajoute assessments, assessmentResults et attempts en conservant les tables précédentes. Chaque copie embarque ses questions, leur version, le barème, le début et une échéance absolue pour les examens.
Les réponses sont conservées après validation, clic sur Enregistrer la réponse ou changement de question. Une saisie en cours non enregistrée n’est pas garantie après fermeture. En entraînement, la validation verrouille la réponse et enregistre une tentative unique. En examen, aucune tentative/correction n’est exposée avant remise.
À expiration, seules les réponses précédemment enregistrées sont notées. Une copie retrouvée après l’échéance est remise à sa prochaine ouverture ; aucun traitement ne s’exécute navigateur fermé. La durée est bornée par l’échéance. La remise et l’enregistrement des tentatives sont transactionnels et idempotents pour éviter les doubles résultats.
Le chronomètre repose sur l’horloge locale : changement manuel de celle-ci et manipulation du stockage peuvent modifier une simulation personnelle. Ce n’est pas une plateforme de surveillance d’examen.
Le temps affiché est la durée écoulée des séances terminées, pauses et fermeture incluses. Les entraînements corrigés mais non terminés alimentent le nombre de corrections, pas encore le temps total.

## CSV et sauvegardes
Un export CSV par séance contient ID, date, format, énoncé, réponse, points, validation et barème. UTF-8 avec BOM, colonnes à virgule, guillemets RFC 4180 et neutralisation des chaînes commençant par un caractère de formule de tableur. L’export n’est pas une sauvegarde réimportable : import/export JSON versionné prévu en phase 6.
