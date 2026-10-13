# Études et essais ClinicalTrials.gov

Vérification : 13 octobre 2026. Recherche documentaire sur demande depuis chaque fiche des 13 substances initiales. Registre international hébergé par NLM aux États-Unis ; aucune assimilation aux AMM ou recommandations françaises.

## Sources et droits

Documentation officielle : https://clinicaltrials.gov/data-api/api ; OpenAPI liée par cette page : https://clinicaltrials.gov/api/oas/v2 (version 2.0.5 observée) ; structure https://clinicaltrials.gov/data-api/about-api/study-data-structure ; conditions https://clinicaltrials.gov/about-site/terms-conditions.

Les conditions autorisent l’accès gratuit, demandent l’attribution ClinicalTrials.gov, des données actualisées, la date de traitement et la déclaration des modifications. Elles précisent des droits internationaux et d’éventuels droits de tiers : ces données ne sont pas déclarées CC0 ni couvertes par la licence ISC du code. L’application affiche attribution, dates, liens originaux et mention « sélection de champs sans modification des valeurs ». Aucun protocole, pièce jointe, coordonnées personnelles, résumé clinique, résultat détaillé ou texte tiers n’est importé. Titres et codes d’origine conservés.

## Appels effectivement vérifiés

GET `https://clinicaltrials.gov/api/v2/version` : `apiVersion=2.0.5`, `dataTimestamp=2026-10-13T09:00:06` au moment de la vérification. La valeur renvoyée n’indique aucun fuseau : elle est affichée littéralement, sans transformation en UTC ou heure de Paris. C’est le traitement de la base annoncé par l’API, consulté avant la recherche, pas une date de validation médicale ni la date exacte de chaque dossier. Le registre annonce un rafraîchissement les jours ouvrables et conseille de consulter cet endpoint.

GET `https://clinicaltrials.gov/api/v2/studies` avec :

- `query.intr=amoxicillin` (champ intervention/treatment, recherche documentaire et synonymes du registre).
- `format=json`, `pageSize=10`, `countTotal=true`.
- `sort=LastUpdatePostDate:desc`.
- `fields=NCTId,BriefTitle,OverallStatus,StudyType,Phase,HasResults,LastUpdatePostDate`.
- Optionnel : `filter.overallStatus=RECRUITING` ou `COMPLETED`.

HTTP 200 pour les deux endpoints ; CORS `*` sur la recherche et appels fetch réels réussis depuis GitHub Pages, sans clé ni cookies. Au test : 1078 dossiers pour amoxicillin, dont 96 au statut RECRUITING. Ces chiffres datés ne sont pas intégrés aux statistiques personnelles. Fixtures originales des réponses version, recherche et recrutement dans e2e/fixtures. L’application charge la source, pas les fixtures.

## Fonctionnement et limites

Chaque recherche indique son nom anglais, son filtre, sa provenance et sa date de téléchargement. Au plus 10 dossiers de la première page ; total signalé et limitation explicite. Pas de pagination locale, de sélection de pertinence ni de revue méthodologique. Les liens NCT ouvrent les dossiers originaux. Dates de dernière mise à jour publiées de chaque dossier séparées du traitement de la base et du téléchargement. Champs absents : « À documenter », sans supposer phase ou disponibilité des résultats.

Recherche dans les interventions : peut retrouver associations, comparateurs et synonymes, sans prouver une identité structurale. Le module distingue études observationnelles, interventionnelles et accès élargi par leurs codes originaux. `hasResults` indique uniquement la disponibilité de résultats dans le registre, pas leur direction, validité ni preuve d’efficacité. Statut COMPLETED distinct de résultats disponibles ; aucune recommandation ou rubrique clinique remplie automatiquement.

Validation Zod : format des identifiants NCT, bornes, dates, absence de doublons, cohérence total/pagination, conformité du statut au filtre. Le cache contrôle URL, substance, filtre, terme, version et provenance. Réponses incohérentes refusées. Les filtres ont des clés distinctes ; changer de filtre masque les résultats précédents. Changer de molécule réinitialise le panneau.

IndexedDB version 13 ajoute trialsCache sans suppression de tables. TTL 1 h, 30 recherches maximum, déduplication des chargements simultanés. Réseau : file sérialisée, cadence locale 1/s, délai 10 s par appel ; quota officiel global non établi dans les sources consultées. HTTP 429/503 : pause Retry-After (secondes ou date, plafond local 300 s, défaut 60 s), aucune relance automatique.

Une copie locale n’est jamais une garantie de statut actuel. Hors ligne : recherches déjà téléchargées, avec avertissement et date. En panne : copie ancienne conservée avec avertissement. Le bouton d’actualisation interroge le registre ; consulter aussi les dossiers originaux pour les données actuelles. Les caches ne sont pas exportés dans la sauvegarde personnelle JSON et ne modifient ni progression ni résultats des examens.

Validation locale : compilation sans erreur TypeScript, 121 tests unitaires réussis et 86 scénarios Playwright réussis sur ordinateur et mobile. Appels réels depuis GitHub Pages et parcours local sur données API réelles vérifiés ; pas de débordement mobile. Les tests couvrent provenance, filtres, dates, absence, doublons, pagination incohérente, limitation réseau, cache persistant, corruption, panne et changement de fiche.

La phase 7 reste partielle. DailyMed demeure un lien externe en raison du CORS observé. OpenFDA, RCSB PDB et Wikidata n’ont pas de connecteur actif. Les fiches locales ne sont pas déclarées validées médicalement.
