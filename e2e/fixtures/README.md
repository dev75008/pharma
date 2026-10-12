# Réponse réglementaire de test

`regulatory-drug.json` est la réponse réelle de `GET https://medicaments-api.giygas.dev/v1/medicaments/60524826`, consultée le 12 octobre 2026 depuis Chromium sur l’origine GitHub Pages. L’en-tête Last-Modified exposé indiquait `Mon, 12 Oct 2026 18:00:01 GMT`. Producteur des données : Base de données publique des médicaments ; retransmission indépendante par Medicaments API / Giygas.

Ces données réglementaires sont utilisées comme instantané de test pour que la CI ne dépende pas du service externe. Les modifications des scénarios (erreur réseau, null, incohérence CIS, prix absent) sont des cas synthétiques de validation logicielle, jamais des données médicales publiées. Licence des fichiers BDPM : Licence Ouverte Etalab, avec attribution ; voir `docs/api-medicaments.md`.
