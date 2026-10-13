# Entraînement quotidien personnalisé

Le tableau de bord et le planning proposent une séance de 5, 10 ou 16 questions, avec prévisualisation des énoncés et des raisons du choix. Aucune réponse ni correction n’est affichée avant de commencer et de valider une question. Banque existante de démonstration, versionnée et sourcée, sans nouvelle génération de contenu médical.

## Sélection locale

Algorithme `daily-practice-1` dans `src/domain/dailyPractice.ts`. Les événements sont calculés à partir des réponses et barèmes réellement enregistrés, avec déduplication par tentative. Les scores importés ne sont pas utilisés aveuglément : le moteur existant recalcule l’exactitude depuis la copie de question et la réponse.

Pour chaque question de la banque actuelle, une seule priorité est retenue :

1. Dernière correction de cette question non entièrement correcte.
2. Classe à moins de 60 % de réponses entièrement correctes, avec au moins trois corrections enregistrées. Les statistiques de classe incluent les étapes de dossiers, comme le tableau de bord ; elles n’établissent pas une compétence clinique.
3. Thème important explicitement choisi et enregistré par l’utilisateur.
4. Aucune correction enregistrée pour la question.
5. Question dont la dernière correction était entièrement correcte, pour rappel.

Dans une priorité, les corrections les plus anciennes passent d’abord ; celles sans correction précèdent les questions déjà corrigées. À égalité, le jour local et l’identifiant stable déterminent une rotation reproducible (hash FNV-1a), puis l’identifiant départage une collision. Même jour, mêmes données et même taille donnent la même sélection. Une nouvelle correction ou un changement de thème peut modifier immédiatement la proposition. Le seuil est un choix pédagogique local, pas un barème national.

Les erreurs sur des questions qui ne figurent plus dans la banque actuelle restent visibles dans les recommandations et corrections historiques, mais ne fabriquent pas une nouvelle question. Les étapes cliniques ne sont pas extraites de leur dossier pour devenir des exercices sans contexte. Les recommandations générales conservent également leurs liens vers fiches, flashcards et dossiers ; cette extension compose uniquement une séance de questions.

## Démarrage et persistance

Le bouton enregistre exactement les questions affichées dans la prévisualisation, en conservant leurs sources et statuts, puis ouvre le moteur existant d’entraînement. Barème sélectionnable : tout ou rien ou points partiels, avec description visible. Pas de chronomètre en entraînement ; correction immédiate après validation, réponse ensuite verrouillée. Garde contre les clics concurrents pendant l’enregistrement et message d’erreur sans suppression de données si le stockage échoue.

Les séances et résultats utilisent les tables personnelles déjà présentes : aucun changement de schéma IndexedDB ni de format de sauvegarde. Les questions sont copiées dans la séance et restent disponibles après rechargement et hors ligne une fois l’application précachée. L’historique, les statistiques, l’export CSV et l’export/import JSON existants s’appliquent à ces entraînements. Les motifs de sélection ne sont pas ajoutés aux résultats : ils sont une explication de la proposition au moment de sa préparation, pas une mesure persistante de maîtrise.

Les entraînements actifs peuvent être repris depuis le panneau (trois récents et lien vers tous les autres). L’utilisateur peut commencer plusieurs séances au cours d’une journée ; le terme « quotidien » décrit la proposition, pas une limitation d’accès. Taille et barème du panneau reviennent à leurs valeurs par défaut à la prochaine ouverture ; la séance créée conserve ses propres paramètres.

La proposition est bloquée tant que les données personnelles sont en chargement ou indisponibles. Les consultations de fiches, les durées prévues au planning et les sources API n’ajoutent aucune réussite simulée à cette sélection.

Validation locale : compilation TypeScript/Vite réussie, 130 tests unitaires et 92 scénarios Playwright réussis sur ordinateur/mobile. Les nouveaux tests vérifient la stabilité, rotation quotidienne, dernière erreur, correction ultérieure, seuil de classe, thèmes choisis, absence de données, unicité, date/taille, prévisualisation, barème, panne de stockage, création et reprise hors ligne. Contrôle visuel mobile sans débordement ; séance réelle créée et retrouvée après rechargement dans un navigateur de vérification isolé.
