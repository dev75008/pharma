# Extension du 14 octobre 2026

Deux synthèses partielles ajoutées : apixaban (ELIQUIS 5 mg, CIS 61902218) et spironolactone (SPIRONOLACTONE BIOGARAN 25 mg, CIS 60625921). Elles rejoignent les familles anticoagulants et diurétiques ; comparateur, recherche, filtres et sessions utilisent leurs identifiants stables.

## Sources effectivement consultées

- [BDPM, spironolactone](https://base-donnees-publique.medicaments.gouv.fr/medicament/60625921/extrait), RCP mis à jour le 8 juillet 2026, consulté le 14 octobre.
- [BDPM, ELIQUIS 5 mg](https://base-donnees-publique.medicaments.gouv.fr/medicament/61902218/extrait) renvoie à l’EMA. Le PDF français n’a pas été accessible pendant cette vérification. Le [RCP européen anglais](https://www.ema.europa.eu/en/documents/product-information/eliquis-epar-product-information_en.pdf) a été consulté, section ELIQUIS 5 mg, pages 36–65. Synthèses françaises originales, sans copie intégrale. Rubrique 10 sans date de révision exploitable : date connue conservée nulle. L’anglais du document ne transforme pas ce RCP européen en étiquetage américain.
- [RCP METFORMINE BGR](https://base-donnees-publique.medicaments.gouv.fr/medicament/69916198/extrait) relu pour les restrictions et précautions, avec rubrique exacte et date du document conservées.
- [RCP rivaroxaban](https://base-donnees-publique.medicaments.gouv.fr/medicament/66086174/extrait) relu pour interactions et limites de surveillance.

PubChem : apixaban CID 10182969 ; spironolactone CID 5833. Les recherches par noms documentaires ont donné une seule identité. ChEMBL a fourni une seule correspondance d’InChIKey complet : CHEMBL231779 et CHEMBL1393. Projections et attribution dans `public/data/additional-chemistry.json` ; données ChEMBL CC BY-SA 3.0 distinctes de la licence du code. Propriétés calculées, sans conclusion d’équivalence de sel, de formulation ou d’efficacité clinique.

Les scripts `expand-library.ts`, `enrich-new-chemistry.ts` et `complete-reasoning-references.ts` retracent cette révision éditoriale. Le premier refuse de remplacer une molécule existante ; les scripts éditoriaux ne sont pas des outils de mise à jour automatique à exécuter aveuglément. La collecte chimique valide les réponses et refuse une écriture concurrente du catalogue.

## Contenus et bilan

15 fiches, 12 familles, 582 champs disponibles sur 750. Les 168 autres restent absents : 127 dans les treize anciennes fiches et 41 dans les deux nouvelles. Élargir la couverture augmente aussi le nombre de rubriques à documenter ; ce nombre n’est pas un pourcentage d’exhaustivité médicale.

Douze exercices originaux contextualisés et une question de demi-vie issue du champ documenté portent la banque à 56 questions. Trois nouveaux dossiers, tous fictifs, portent le total à dix. Les cartes dérivées des champs disponibles portent le total à 52. Statuts `demo` et `documentary-summary` maintenus ; aucune relecture indépendante ou conformité au programme national n’est revendiquée.

La page Sources ajoute un bilan réel filtrable par famille et exportable en JSON. Les rubriques absentes gardent leur motif. Une consultation antérieure à 180 jours déclenche une invitation à relire le champ, sans affirmer que le RCP a changé. Le bilan documentaire ne contient pas les résultats personnels.

## Procédure de relecture indépendante à réaliser

Un enseignant ou pharmacien compétent doit comparer chaque champ et proposition avec la source actuelle, vérifier le contexte/formulation, puis attester la correction et les objectifs universitaires. La présence d’une source officielle ne suffit pas à qualifier une question de validée. Aucun statut ne doit être élevé automatiquement en fonction du score, du nombre de sources ou de l’ancienneté.

La bibliothèque demeure partielle. Les intégrations soumises à licence, l’audit avec lecteurs d’écran et les matériels réels restent distincts des tests logiciels et ne sont pas déclarés obtenus.
