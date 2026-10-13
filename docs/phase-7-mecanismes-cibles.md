# Phase 7 — mécanismes et cibles ChEMBL

## Fonctionnement

Après une correspondance structurale PubChem/ChEMBL exacte, la fiche propose **Charger les mécanismes ChEMBL**. Le connecteur interroge le parent déclaré dans l'enregistrement ChEMBL, ou le composé reconnu si aucun parent n'est renseigné. L'interface affiche les deux identifiants et indique leur différence éventuelle. Aucun autre sel, stéréoisomère ou nom ressemblant n'est substitué.

La première page fournit au maximum vingt mécanismes : description originale en anglais, type d'action déclaré, identifiant de mécanisme, cible associée et références bibliographiques. Les valeurs sont conservées, sans traduction ou génération de correction médicale. Une réponse vide est affichée comme une absence de résultat, pas comme une absence de mécanisme pharmacologique. Une liste paginée est signalée non exhaustive ; aucune pagination automatique n'est déclenchée.

Les détails de chaque cible se chargent séparément sur demande : nom original, organisme déclaré, type de cible, indication éventuelle d'un groupe d'espèces, composants et accessions déclarés. Une famille bactérienne n'est pas présentée comme une protéine humaine unique. Les réponses de cibles portent obligatoirement l'identifiant demandé.

Ces données restent un supplément documentaire distinct des RCP français. Aucune indication, posologie, interaction, question ou flashcard n'est déduite automatiquement des mécanismes. Les rubriques cliniques de la bibliothèque ne sont pas écrasées.

## API et disponibilité vérifiées

Documentation officielle : https://chembl.gitbook.io/chembl-interface-documentation/web-services/chembl-data-web-services ; licence : https://chembl.gitbook.io/chembl-interface-documentation/frequently-asked-questions/general-questions.

Le 13 octobre 2026, l'endpoint précédemment indisponible a de nouveau répondu :

- `GET https://www.ebi.ac.uk/chembl/api/data/mechanism.json?molecule_chembl_id=CHEMBL1082&limit=20` : HTTP 200, un mécanisme et cible CHEMBL2354204.
- `GET https://www.ebi.ac.uk/chembl/api/data/target/CHEMBL2354204.json` : HTTP 200, organisme déclaré `Bacteria`, type `PROTEIN FAMILY`.
- Requête CHEMBL645 : réponse valide vide, conservée comme absence explicite de résultat.

L'identité de CHEMBL1082 a été vérifiée avec le CID PubChem 33613 et son InChIKey complet. Les deux premiers endpoints ont été testés par `fetch` natif depuis l'origine GitHub Pages, sans clé, avec CORS, `credentials: omit`, `cache: no-store` et Accept JSON. Disponibilité observée, sans garantie de service futur. Les descriptions et références restent celles de ChEMBL, sans reprise du texte d'un livre cité.

## Sécurité, provenance et cache

Schémas Zod, vérification du composé demandé, unicité des mécanismes, cohérence du nombre de résultats/pagination et contrôle des identifiants de cible. Les références HTTP/HTTPS fournies par la base peuvent être ouvertes avec `noopener noreferrer` ; protocoles actifs, URLs invalides et identifiants de connexion intégrés aux URLs ne produisent pas de lien. Un lien HTTP est explicitement identifié. Aucune insertion de HTML externe.

IndexedDB v11 ajoute `chemblKnowledge`, sans modifier les tables personnelles. Cache documentaire séparé de la correspondance structurale : 24 h, quarante réponses maximum. Une clé de mécanismes contient l'InChIKey, le composé reconnu et l'identifiant réellement interrogé ; une cible utilise son propre identifiant. Les requêtes identiques sont dédupliquées et utilisent la file ChEMBL existante (cadence locale 1/s, délai 10 s, contrôle 429/503 et Retry-After, sans répétition automatique).

En panne, une ancienne copie reste lisible avec date et avertissement ; hors ligne, seuls les mécanismes/cibles déjà téléchargés sont disponibles. Date de consultation conservée, date de mise à jour source inconnue. Les changements de correspondance/parent ou de cible réinitialisent les lecteurs concernés pour éviter l'affichage d'un résultat associé à une autre identité. Les caches ne sont pas inclus dans la sauvegarde personnelle JSON.

Données attribuées à **EMBL-EBI ChEMBL**, licence **CC BY-SA 3.0** affichée avec chaque réponse. Champs sélectionnés sans modification de leurs valeurs. Les fixtures ChEMBL gardent cette licence, distincte de celle du code applicatif. L'IP et les identifiants sont transmis au service lors du chargement volontaire.

## Tests et limites

Tests des réponses réelles, organismes/types, clé structurale, parent déclaré, autre molécule/cible refusées, liste vide, pagination, provenance, déduplication et conservation d'une copie datée. Scénarios ordinateur/mobile : mécanisme, cible, références, lecture hors ligne, absence et erreur d'identité. La CI utilise des instantanés réels, pas le service externe.

Validation locale du 13 octobre 2026 : compilation TypeScript/Vite, 105 tests Vitest et 76 scénarios Playwright réussis. La suite unitaire a été relancée seule après un dépassement de délai du test de notes pendant l'exécution simultanée des suites. Inspection mobile à 390 px avec réponses réseau réelles : mécanisme/cible visibles, aucun débordement.

Les autres connecteurs et la relecture médicale indépendante restent à développer. Cette intégration n'achève pas toute la phase 7 ni le remplissage des données manquantes de la bibliothèque.

Commit prévu : `feat: add sourced ChEMBL mechanisms and biological targets`.
