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
| PubChem | https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest ; propriétés chimiques, limite documentée 5 requêtes/s | Instantanés des 13 CID, structures 2D ; pas de connecteur navigateur |
| ChEMBL | https://chembl.gitbook.io/chembl-interface-documentation/web-services/chembl-data-web-services ; https://chembl.gitbook.io/chembl-interface-documentation/frequently-asked-questions/general-questions ; CC BY-SA 3.0 | Lien ; identité moléculaire, licence des dérivés, quotas et CORS à traiter avant import |
| OpenFDA | https://open.fda.gov/apis/drug/label/ ; https://open.fda.gov/apis/authentication/ | Lien ; informations américaines. Documentation présente des quotas sans clé malgré une formulation introductive ambiguë sur sa nécessité ; aucun accès sans clé testé ici |
| RxNav | https://lhncbc.nlm.nih.gov/RxNav/APIs/index.html | Lien ; normalisation US, certaines fonctions/vocabulaires demandent clé UMLS/licence ; aucun mapping vers CIS/CIP |
| DailyMed | https://dailymed.nlm.nih.gov/dailymed/app-support-web-services.cfm | Lien ; SPL américains, aucune importation de notices |
| RCSB PDB | https://data.rcsb.org/ ; https://www2.rcsb.org/pages/usage-policy | Lien ; archive PDB CC0, autres contenus du site distincts ; aucun visualiseur 3D implémenté |
| ClinicalTrials.gov | https://clinicaltrials.gov/data-api/api | Lien ; registre d'essais, pas une recommandation ni garantie d'efficacité |
| Wikidata | https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service | Lien ; données structurées CC0, service en migration 2026–2027 ; relations collaboratives à contrôler |

Pour ces sources en lien, aucun test CORS, quotas ou connecteur n'est annoncé comme accompli. Chaque future intégration devra vérifier les conditions actuelles, une requête réelle, l'identité des substances et les dates, et ajouter des tests. Les RCP ANSM/BDPM restent prioritaires pour les spécialités françaises. Les notifications de pharmacovigilance ne permettent pas de calculer une incidence ou une causalité sans analyse appropriée.
