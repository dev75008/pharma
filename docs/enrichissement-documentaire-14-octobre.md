# Complément documentaire du 14 octobre 2026

43 champs ajoutés : **522 disponibles / 650**, **128 absents**. Aucune validation médicale indépendante revendiquée.

13 liens ChEMBL ont été rapprochés des 13 CID PubChem déjà documentés, par InChIKey complet strictement identique et résultat ChEMBL unique. Les requêtes utilisent les adaptateurs validés, une file séquentielle par fournisseur à une requête/s, et abandonnent l’écriture du catalogue si une erreur survient. Les identités parent, sels, hydrates et formulations ne sont jamais assimilés à une équivalence clinique.

Instantané contrôlable : `public/data/chemical-identifiers.json`, propriétés structurales PubChem et projection de molécules ChEMBL. Chaque champ conserve les URL exactes, date de consultation et date de mise à jour inconnue. Attribution PubChem et ChEMBL ; données ChEMBL sous [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), distinctes de la licence ISC du code. Sources et politique : [ChEMBL web services](https://www.ebi.ac.uk/chembl/api/data/docs), [ChEMBL FAQ](https://chembl.gitbook.io/chembl-interface-documentation/frequently-asked-questions/chembl-data-questions), [PubChem PUG REST](https://pubchem.ncbi.nlm.nih.gov/pcfe/docs/markdown/pug-rest.md).

Commande de mise à jour structurale : `npx tsx scripts/refresh-chemical-identifiers.ts`. Ce script n’importe aucun champ médical. Examiner le diff, les identités et les licences avant publication. Une absence de correspondance conserve le champ existant ; elle ne supprime pas une précédente référence. La version de contenu du script est celle de cette révision datée et doit être adaptée lors d’une nouvelle révision.

14 ajouts RCP après relecture des pages officielles :

- [Bisoprolol TEVA 10 mg](https://base-donnees-publique.medicaments.gouv.fr/medicament/60524826/extrait), 4.2 : contextes rénal et hépatique.
- [Ramipril BIOGARAN 5 mg](https://base-donnees-publique.medicaments.gouv.fr/medicament/61599041/extrait), 5.1 : conséquences physiologiques et effets thérapeutiques.
- [Losartan BIOGARAN 50 mg](https://base-donnees-publique.medicaments.gouv.fr/medicament/66659784/extrait), 5.1 : conséquences physiologiques et effets thérapeutiques.
- [Paracétamol B. Braun IV](https://base-donnees-publique.medicaments.gouv.fr/medicament/61304982/extrait), 4.1/5.1/4.9 : indications, contexte, effet dans le temps et surveillance du surdosage. Aucun schéma systématique de traitement usuel déduit.
- [Prednisolone TEVA 5 mg](https://base-donnees-publique.medicaments.gouv.fr/medicament/69200035/extrait), 4.2/4.4/4.5 : surveillances clinique et biologique contextuelles.
- [Metformine BGR 500 mg](https://base-donnees-publique.medicaments.gouv.fr/medicament/69916198/extrait), 4.4 : surveillance clinique contextuelle.
- [Rivaroxaban KRKA 20 mg](https://base-donnees-publique.medicaments.gouv.fr/medicament/66086174/extrait), 4.4/4.5 : précautions et complément de l’interaction AINS/antiagrégants/ISRS, avec nouvelle consultation tracée.

Trois champs de prednisolone (cible, mécanisme et type d’action) sont des paraphrases originales courtes du [Collège national de pharmacologie médicale](https://pharmacomedicale.org/medicaments/par-specialites/item/corticoides-les-points-essentiels), page datée du 5 juin 2025. Mécanisme de classe, provenance CNPM distincte du RCP. Aucun cours, image ou tableau reproduit ; pas d’import des recommandations cliniques anciennes. La cible précise de la metformine reste absente : elle n’est pas réduite artificiellement à un mécanisme unique.

13 rubriques de pièges pédagogiques originales ajoutées, à partir des champs déjà documentés. Sources conservées, sans annoncer une liste de pièges officielle ou une fréquence d’examen. Elles distinguent notamment molécule/métabolite, demi-vie/durée d’effet et formulation injectable/orale. `scripts/documentary-additions.ts` conserve les décisions éditoriales de cette révision ; ne pas exécuter ce script historique pour actualiser automatiquement les données après une future révision RCP.

Les mécanismes non établis, les données absentes des sources consultées et les recommandations thérapeutiques sans référentiel restent absents. Une donnée manquante n’est pas nécessairement applicable à toute molécule, et remplir toutes les cases ne constitue pas un objectif scientifique valable à lui seul.
