# Mise à jour documentaire

1. Consulter manuellement la source primaire originale. Vérifier la spécialité, formulation, indication, contexte et rubrique. Les versions mobiles et principales peuvent afficher des dates différentes : référencer la page effectivement utilisée.
2. Rédiger une synthèse originale brève ; ne pas copier une monographie ni étendre une information de spécialité à toute une classe. Pour toute donnée non établie, garder le statut missing.
3. Modifier `src/data/drugs.json` : valeur, scope/context, sourceId, URL HTTPS exacte, locator, consultedAt, sourceUpdatedAt (null si inconnue), vérification source-checked. Réserver independently-reviewed à une véritable relecture indépendante traçable.
4. Incrémenter contentVersion. Conserver les identifiants utilisés par le stockage local. Pour les relations, mettre à jour les classes, cibles et indications ; les cibles et indications sont actuellement dérivées des champs sourcés.
5. Exécuter npm run test, npm run build, npm run test:e2e. Vérifier la cohérence scientifique par relecture humaine avant d’attribuer une validation indépendante.
6. Publier sur main. Les données sont des instantanés de compilation et ne sont pas actualisées automatiquement. La consultation est signalée comme ancienne après 180 jours : ce seuil technique est une alerte de relecture, pas une garantie de validité pendant six mois.

Un adaptateur réseau réglementaire Giygas/BDPM est actif (voir `api-medicaments.md`). Les synthèses cliniques restent des instantanés statiques, mis à jour manuellement ; les données de cet adaptateur ne les écrasent pas. Avant sa création, documenter API officielle, licence, quotas, CORS, politique de cache et tests ; sinon garder liens et import statique légal. Aucun secret dans le frontend.
