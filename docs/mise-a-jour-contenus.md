# Mise à jour documentaire

Avant une modification, conserver un export `npm run review:export -- review/avant.json`. Après modification, exporter `review/apres.json` et exécuter `npm run review:diff -- review/avant.json review/apres.json review/differences.json` pour identifier les éléments à relire. Voir [comparer-les-revisions.md](comparer-les-revisions.md) pour les limites des empreintes et les chemins de différences.

1. Consulter manuellement la source primaire originale. Vérifier la spécialité, formulation, indication, contexte et rubrique. Les versions mobiles et principales peuvent afficher des dates différentes : référencer la page effectivement utilisée.
2. Rédiger une synthèse originale brève ; ne pas copier une monographie ni étendre une information de spécialité à toute une classe. Pour toute donnée non établie, garder le statut missing.
3. Modifier `src/data/drugs.json` : valeur, scope/context, sourceId, URL HTTPS exacte, locator, consultedAt, sourceUpdatedAt (null si inconnue), vérification source-checked. Réserver independently-reviewed à une véritable relecture indépendante traçable.
4. Incrémenter contentVersion. Conserver les identifiants utilisés par le stockage local. Pour les relations, mettre à jour les classes, cibles et indications ; les cibles et indications sont actuellement dérivées des champs sourcés.
5. Exécuter npm run test, npm run build, npm run test:e2e. Vérifier la cohérence scientifique par relecture humaine avant d’attribuer une validation indépendante.
6. Publier sur main. Les données sont des instantanés de compilation et ne sont pas actualisées automatiquement. La consultation est signalée comme ancienne après 180 jours : ce seuil technique est une alerte de relecture, pas une garantie de validité pendant six mois.

Un adaptateur réseau réglementaire Giygas/BDPM est actif (voir `api-medicaments.md`). Les synthèses cliniques restent des instantanés statiques, mis à jour manuellement ; les données de cet adaptateur ne les écrasent pas. Avant sa création, documenter API officielle, licence, quotas, CORS, politique de cache et tests ; sinon garder liens et import statique légal. Aucun secret dans le frontend.

Révision du 14 octobre : voir `enrichissement-documentaire-14-octobre.md`. Le script `refresh-chemical-identifiers.ts` relit PubChem/ChEMBL avec une correspondance structurale exacte et conserve un instantané ; il ne met pas à jour la pharmacologie clinique. Le script `documentary-additions.ts` est un historique éditorial daté, pas un actualiseur de RCP : ne pas l’appliquer aveuglément à une révision ultérieure.

Après modification des questions, incrémenter `questionContentVersion`. Le mélange optionnel enregistre l’ordre et les bonnes réponses dans la copie de séance ; les séances anciennes conservent leurs propres instantanés. Les contenus de démonstration ne deviennent pas validés par la réussite des tests logiciels.
# Bilan visible des données

La page Sources permet de filtrer et exporter les champs absents, leur motif et les besoins de relecture. Le seuil de 180 jours porte sur la consultation de chaque référence, sans prétendre qu’un document a changé. Le détail de la révision apixaban/spironolactone figure dans [extension-bibliotheque-et-relecture.md](extension-bibliotheque-et-relecture.md). Les scripts datés sont une trace éditoriale, pas un remplacement automatique des sources.
