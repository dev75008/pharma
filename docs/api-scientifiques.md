# Sources scientifiques complémentaires

Vérification documentaire : 12 octobre 2026. Le registre dans `src/data/sources.ts` indique ce qui est connecté, préparé en instantané ou accessible uniquement par lien. Les API publiques ne constituent pas toutes des référentiels cliniques français.

## Connecteur Europe PMC opérationnel

Documentation officielle : https://europepmc.org/RestfulWebService et https://europepmc.org/developers ; droits : https://europepmc.org/help (copyright des auteurs et éditeurs).

GET `https://www.ebi.ac.uk/europepmc/webservices/rest/search` avec `query=TITLE_ABS:"bisoprolol" AND SRC:MED`, `format=json`, `resultType=lite`, `pageSize=10`. API 6.9 observée, sans clé ; HTTP 200 et `Access-Control-Allow-Origin: *` avec Origin `https://dev75008.github.io`. Le fichier de fixture est la réponse réelle reçue le 12 octobre 2026 ; ce n'est ni une sélection clinique ni le contenu initial des fiches.

Chaque fiche propose une recherche volontaire avec un terme anglais explicite. Paracétamol utilise acetaminophen. Le résultat bibliographique n'est pas une correspondance structurale ni une preuve de pertinence clinique. On affiche les titres, auteurs, revue, année et PMID, avec liens vers les articles. Aucun résumé ou texte intégral n'est importé. L'accès ouvert signalé par l'API ne garantit pas un droit de reproduction.

Validation Zod de la réponse, recherche retournée et provenance ; refus des sources autres que MED et des doublons. Cache IndexedDB version 7, 24 h, au plus 30 recherches, déduplication des requêtes simultanées, délai de 10 secondes, 1 requête/s localement, suspension 60 s après 429 sans nouvelle tentative automatique. Le quota global officiel n'a pas été établi : cette cadence est une précaution locale, pas une garantie. Réseau en panne : ancienne copie conservée avec sa date ; hors ligne : résultats déjà téléchargés uniquement. Mise à jour de la base inconnue. Aucune modification automatique des champs cliniques ou questions.

## Autres ressources : état précis

| Source | Documentation officielle et usage | État dans MEDREVISION |
|---|---|---|
| PubChem | https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest ; propriétés chimiques, limite documentée 5 requêtes/s | Instantanés des 13 CID et connecteur navigateur de propriétés : voir docs/phase-7-donnees-moleculaires.md |
| ChEMBL | https://chembl.gitbook.io/chembl-interface-documentation/web-services/chembl-data-web-services ; https://chembl.gitbook.io/chembl-interface-documentation/frequently-asked-questions/general-questions ; CC BY-SA 3.0 | Correspondance par InChIKey connectée avec attribution CC BY-SA ; mécanismes du parent et cibles connectés sur demande : voir docs/phase-7-mecanismes-cibles.md |
| OpenFDA | https://open.fda.gov/apis/drug/label/ ; https://open.fda.gov/apis/authentication/ | Métadonnées SPL sur demande, cinq résultats et liens DailyMed ; nom exact et dates contrôlés, cache 24 h, appel réel sans clé depuis GitHub Pages vérifié le 14/10/2026. Aucun champ clinique français rempli. Voir openfda.md |
| RxNav | https://lhncbc.nlm.nih.gov/RxNav/APIs/index.html | Connecteur exact actif puis propriétés IN ; attribution NLM, cache 24 h, CORS navigateur vérifié ; aucun mapping CIS/CIP. Voir phase-7-rxnorm.md |
| DailyMed | https://dailymed.nlm.nih.gov/dailymed/app-support-web-services.cfm | Lien vers les notices américaines ; API répond au serveur mais CORS bloque GitHub Pages, aucun import. Voir phase-7-rxnorm.md |
| RCSB PDB | https://data.rcsb.org/ ; https://www2.rcsb.org/pages/usage-policy | Lien ; archive PDB CC0, autres contenus du site distincts ; aucun visualiseur 3D implémenté |
| ClinicalTrials.gov | https://clinicaltrials.gov/data-api/api | Recherche intervention sur demande, 10 dossiers avec filtres, dates et liens ; cache 1 h, CORS réel vérifié. Voir phase-7-essais-cliniques.md ; aucune déduction clinique |
| Wikidata | https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service | Lien ; données structurées CC0, service en migration 2026–2027 ; relations collaboratives à contrôler |

Pour ces sources en lien, aucun test CORS, quotas ou connecteur n'est annoncé comme accompli. Chaque future intégration devra vérifier les conditions actuelles, une requête réelle, l'identité des substances et les dates, et ajouter des tests. Les RCP ANSM/BDPM restent prioritaires pour les spécialités françaises. Les notifications de pharmacovigilance ne permettent pas de calculer une incidence ou une causalité sans analyse appropriée.
