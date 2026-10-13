# Phase 7 — première extension moléculaire

## Connecteurs disponibles

Dans chaque fiche, **Données moléculaires PubChem et ChEMBL** propose deux chargements explicites, sans requête sur ouverture de la fiche :

1. PubChem PUG REST : CID déjà documenté dans la bibliothèque, formule, masse moléculaire, SMILES, InChIKey, XLogP et TPSA. XLogP/TPSA sont des propriétés calculées, pas des mesures cliniques. CID retourné contrôlé ; propriétés optionnelles absentes affichées « À documenter ».
2. ChEMBL : recherche du **même InChIKey complet**. Une seule correspondance est nécessaire ; refus des résultats incomplets, clés différentes ou correspondances multiples. Zéro résultat reste une absence explicite. Identifiant, nom, clé et parent déclaré conservés ; aucun rapprochement par DCI/nom ni substitution par une structure apparentée.

L'entité PubChem peut différer d'un sel, hydrate ou formulation de la spécialité française. Une égalité d'InChIKey concerne la représentation structurale standardisée de ces bases, pas une preuve d'équivalence pharmaceutique ou clinique. Les valeurs et identifiants du supplément ne remplacent pas les champs de la synthèse française. Aucun mécanisme, indication, adaptation posologique, interaction ou question médicale n'est généré à partir de ces données.

## Vérifications du 13 octobre 2026

Documentation officielle :

- https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
- https://pubchem.ncbi.nlm.nih.gov/docs/citation-guidelines
- https://pubchem.ncbi.nlm.nih.gov/docs/data-sources
- https://chembl.gitbook.io/chembl-interface-documentation/web-services/chembl-data-web-services
- https://chembl.gitbook.io/chembl-interface-documentation/frequently-asked-questions/general-questions

GET réel depuis l'origine GitHub Pages, avec `credentials: omit`, `cache: no-store`, `Accept: application/json` :

`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2405/property/MolecularFormula,MolecularWeight,InChIKey,SMILES,XLogP,TPSA/JSON`

HTTP 200, CID 2405, InChIKey `VHYCDWMUTMEGQY-UHFFFAOYSA-N`.

`https://www.ebi.ac.uk/chembl/api/data/molecule.json?molecule_structures__standard_inchi_key=VHYCDWMUTMEGQY-UHFFFAOYSA-N&limit=5`

HTTP 200, une seule correspondance, `CHEMBL645`, même InChIKey. Le lien de consultation https://www.ebi.ac.uk/chembl/explore/compound/CHEMBL645 est vérifié. Ces contrôles démontrent la disponibilité/CORS observés, pas une garantie future.

Une vérification ultérieure de PubChem a retourné HTTP 503. L'interface a correctement affiché l'indisponibilité sans répétition automatique. L'inspection visuelle mobile a donc utilisé les fixtures issues des réponses réelles figées, sans prétendre que le service était disponible à ce moment-là.

L'endpoint documenté de mécanismes ChEMBL a répondu HTTP 500, puis une autre requête a dépassé 20 s. Son import n'est donc pas activé. Mécanismes et cibles restent à consulter sur le site source ; ils ne sont pas annoncés comme intégrés. Les autres API internationales restent à leur état explicite dans le registre.

## Réseau, cache et droits

Schémas Zod, contrôle du CID et des clés, réponses supplémentaires écartées. Files de requêtes séparées par fournisseur, cadence locale 1 requête/s par onglet. PubChem documente au maximum 5/s ; quota global ChEMBL non établi. Les restrictions du service peuvent dépendre de l'IP et de la charge : la cadence locale n'offre pas de garantie globale. Timeout 10 s ; 429/503 suspendent les appels selon Retry-After (plafond 300 s, sinon 30 s), sans nouvelle tentative automatique. Une réponse HTML/JSON invalide n'est pas interprétée comme donnée scientifique.

IndexedDB v10 ajoute `molecularCache` ; 24 h et 40 réponses cumulées au maximum. Clés séparées par fournisseur/identité, URLs de provenance vérifiées, requêtes identiques dédupliquées. Hors ligne, seules les réponses déjà téléchargées sont disponibles. En panne, ancienne copie conservée avec date et avertissement ; rechargement ne prétend pas fournir une date de mise à jour de la base. Ces dates ne figurent pas dans les réponses utilisées et restent inconnues. L'IP et l'identifiant sont transmis au fournisseur sur demande. Caches exclus de la sauvegarde JSON personnelle.

PubChem : attribution au service pour les propriétés chimiques ; aucune annotation clinique de fournisseur tiers redistribuée. Les licences des annotations PubChem ne sont pas assimilées à une licence générale de toute la base.

ChEMBL : données sous **CC BY-SA 3.0**, attribution EMBL-EBI ChEMBL et lien de licence dans l'interface. Sélection de champs dont les valeurs ne sont pas modifiées. La fixture `e2e/fixtures/chembl-bisoprolol.json` et les données ChEMBL correspondantes conservent cette licence, distincte du code applicatif. Aucun logiciel serveur ChEMBL n'est copié.

## Tests et suite

Tests : réponses réelles figées, CID/key incorrects, ambiguïté, absence/incomplétude, provenance de cache, débit et Retry-After, déduplication, réouverture et lecture hors ligne, conservation d'une copie périmée et parcours mobile. Fixtures synthétiques d'erreur réservées aux tests ; jamais publiées comme données médicales.

Résultat local : compilation réussie, 98 tests Vitest et 70 scénarios Playwright réussis. Module unique après les mises à jour du stockage, mobile à 390 px sans débordement. Aucun résultat d'un service indisponible n'est substitué par une donnée inventée.

La phase 7 reste partielle : propriétés et identités sont connectées, pas les mécanismes/cibles ChEMBL ni tous les autres services listés. Poursuivre après disponibilité vérifiée, droits et contrôle scientifique des correspondances. Les 171 champs cliniques/pédagogiques non documentés ne sont pas remplis par supposition.

Commit prévu : `feat: add verified PubChem and ChEMBL molecular adapters`.
