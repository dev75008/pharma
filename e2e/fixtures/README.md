# Réponse réglementaire de test

Fixtures supplémentaires du 13 octobre 2026 : `pubchem-amoxicillin.json` (CID 33613, attribution PubChem), `chembl-amoxicillin.json` (correspondance exacte CHEMBL1082), `chembl-amoxicillin-mechanisms.json` (mécanismes du même composé) et `chembl-amoxicillin-target.json` (cible CHEMBL2354204). Réponses originales, aucun scénario médical inventé. Les **trois fichiers ChEMBL sont sous CC BY-SA 3.0**, attribution EMBL-EBI ChEMBL, https://www.ebi.ac.uk/chembl/, licence https://creativecommons.org/licenses/by-sa/3.0/. Références bibliographiques conservées ; aucun texte des ouvrages cités n'est reproduit. Voir `docs/phase-7-mecanismes-cibles.md` pour les URLs et limites.

`pubchem-bisoprolol.json` : réponse réelle PubChem PUG REST pour le CID 2405, propriétés chimiques consultées le 13 octobre 2026 ; attribution PubChem, voir `docs/phase-7-donnees-moleculaires.md`.

`chembl-bisoprolol.json` : réponse réelle de l'API EMBL-EBI ChEMBL, recherche par InChIKey complet du CID 2405, consultée le 13 octobre 2026. Une correspondance : CHEMBL645. **Données sous CC BY-SA 3.0**, attribution EMBL-EBI ChEMBL : https://www.ebi.ac.uk/chembl/ ; licence https://creativecommons.org/licenses/by-sa/3.0/. Fixture inchangée, pas de reproduction des pages web ou de mécanisme médical ajouté. La licence de ces données est distincte de celle du code.

`europe-pmc.json` : réponse bibliographique réelle, API Europe PMC 6.9, reçue le 12 octobre 2026 pour `TITLE_ABS:"bisoprolol" AND SRC:MED`, `resultType=lite`, `pageSize=10`. Références seules, aucun résumé ou texte intégral. Instantané de test non distribué dans les fiches. Droits des articles : auteurs/éditeurs ; voir `docs/api-scientifiques.md`.

`regulatory-drug.json` est la réponse réelle de `GET https://medicaments-api.giygas.dev/v1/medicaments/60524826`, consultée le 12 octobre 2026 depuis Chromium sur l’origine GitHub Pages. L’en-tête Last-Modified exposé indiquait `Mon, 12 Oct 2026 18:00:01 GMT`. Producteur des données : Base de données publique des médicaments ; retransmission indépendante par Medicaments API / Giygas.

Ces données réglementaires sont utilisées comme instantané de test pour que la CI ne dépende pas du service externe. Les modifications des scénarios (erreur réseau, null, incohérence CIS, prix absent) sont des cas synthétiques de validation logicielle, jamais des données médicales publiées. Licence des fichiers BDPM : Licence Ouverte Etalab, avec attribution ; voir `docs/api-medicaments.md`.

`rcp-excerpt.json` contient deux rubriques inchangées (1 et 4.1) de la réponse réelle de `/v1/medicaments/60524826/rcp`, consultée le 12 octobre 2026. Date source : 20 octobre 2025 ; attribution : ANSM - Base de données publique des médicaments. Cet extrait sert uniquement aux tests, ne prétend pas être le RCP complet et n’est pas distribué comme contenu pédagogique dans le bundle.
# RxNorm

`rxnorm-amoxicillin-search.json` et `rxnorm-amoxicillin-properties.json` : réponses réelles NLM reçues le 13 octobre 2026, recherche exacte active amoxicillin puis propriétés du RxCUI 723, sans modification. Données publiques non propriétaires de RxNorm ; conditions https://lhncbc.nlm.nih.gov/RxNav/TermsofService.html. Attribution NLM affichée dans l’application. Aucun contenu DailyMed importé.
# ClinicalTrials.gov

`clinicaltrials-version.json`, `clinicaltrials-amoxicillin.json` et `clinicaltrials-amoxicillin-recruiting.json` : réponses réelles reçues le 13 octobre 2026. API v2.0.5, recherche intervention amoxicillin, première page de 10 dossiers, champs projetés listés dans docs/phase-7-essais-cliniques.md. Réponses sans modification des valeurs ; aucune pièce jointe, résumé, résultat détaillé ou coordonnée copiée. Attribution ClinicalTrials.gov, droits et conditions https://clinicaltrials.gov/about-site/terms-conditions. Aucune déclaration CC0 ou application de la licence ISC du code à ces données.
