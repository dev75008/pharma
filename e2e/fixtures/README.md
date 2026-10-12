# Réponse réglementaire de test

`regulatory-drug.json` est la réponse réelle de `GET https://medicaments-api.giygas.dev/v1/medicaments/60524826`, consultée le 12 octobre 2026 depuis Chromium sur l’origine GitHub Pages. L’en-tête Last-Modified exposé indiquait `Mon, 12 Oct 2026 18:00:01 GMT`. Producteur des données : Base de données publique des médicaments ; retransmission indépendante par Medicaments API / Giygas.

Ces données réglementaires sont utilisées comme instantané de test pour que la CI ne dépende pas du service externe. Les modifications des scénarios (erreur réseau, null, incohérence CIS, prix absent) sont des cas synthétiques de validation logicielle, jamais des données médicales publiées. Licence des fichiers BDPM : Licence Ouverte Etalab, avec attribution ; voir `docs/api-medicaments.md`.

`rcp-excerpt.json` contient deux rubriques inchangées (1 et 4.1) de la réponse réelle de `/v1/medicaments/60524826/rcp`, consultée le 12 octobre 2026. Date source : 20 octobre 2025 ; attribution : ANSM - Base de données publique des médicaments. Cet extrait sert uniquement aux tests, ne prétend pas être le RCP complet et n’est pas distribué comme contenu pédagogique dans le bundle.
