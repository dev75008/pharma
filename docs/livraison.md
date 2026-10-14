# Livraison technique MEDREVISION

Version préparée le 14 octobre 2026. L’application est une plateforme personnelle sans backend obligatoire, publiée par GitHub Actions avec routes HashRouter, stockage IndexedDB, PWA et sauvegardes locales. Ce bilan décrit les moteurs livrés et leurs limites ; il ne déclare pas l’ensemble du cahier des charges achevé ou médicalement validé.

Validation : **171 tests unitaires réussis** après ajout de six tests de comparaison documentaire ; compilation TypeScript/Vite et contrôles de livraison réussis. La précédente livraison a également réussi 130 scénarios Chromium ordinateur/mobile et 68 parcours Firefox/WebKit, avec audits axe sur 17 routes en clair/sombre dans les deux présentations. Ces vérifications ne constituent pas un audit général de sécurité ou une validation médicale.

| Phase | Résultat livré |
|---|---|
| 1 | Architecture React/TypeScript, navigation, recherche globale, mobile, thèmes, PWA |
| 2 | Bibliothèque, pages de famille et sous-classes, fiches sourcées, favoris, notes, historique, progression réelle, navigation pédagogique liée, comparateur 2–4 et PDF par impression |
| 3 | Six formats, filtres classe/spécialité/objectif, mélange optionnel conservé à la reprise, entraînements, examens chronométrés, corrections et CSV ; 65 exercices de démonstration |
| 4 | 55 cartes documentaires, cartes personnelles, six types, SM-2 adapté, échéances et séances |
| 5 | Onze dossiers progressifs fictifs : neuf de trois étapes, un AOMI de quatre et un transversal de cinq, sources, réponses verrouillées, reprise et bilans |
| 6 | Statistiques réelles, planning, objectifs, thèmes, recommandations, séances quotidiennes et sauvegardes JSON validées |
| 7 | Registre, connecteurs publics documentés, RCP, chimie/propriétés/mécanismes/cibles, bibliographie, identifiants, études et métadonnées américaines OpenFDA ; conformères 3D ; import légal de paquets à la compilation |
| 8 | Tests unitaires et navigateur, audits automatiques d’accessibilité, compatibilité Firefox/WebKit, vérifications de livraison et déploiement automatique |

## Périmètre documentaire

15 molécules et 12 familles ; 628 champs disponibles sur 750. Les 122 autres restent absents avec un motif : 87 dans les treize anciennes fiches et 35 dans les deux nouvelles. Les panneaux API enrichissent la consultation sans remplacer ces champs. La bibliothèque peut être étendue par paquets versionnés : fiches/classes/spécialités/systèmes, questions, cartes et dossiers. Les nouveaux exercices utilisent uniquement les champs disponibles avec leurs références ; statuts demo ou documentary-summary maintenus. Aucune génération médicale en ligne ni validation indépendante revendiquée. Les ajouts RCP/CNPM et les 13 premières correspondances ChEMBL sont détaillés dans enrichissement-documentaire-14-octobre.md ; le complément RCP/HAS de la metformine et les pages de classe dans classes-et-strategie.md. Apixaban, spironolactone, deux nouvelles correspondances chimiques, douze exercices contextualisés, trois dossiers et le bilan documentaire figurent dans extension-bibliotheque-et-relecture.md.

Les dossiers supplémentaires couvrent amoxicilline, rivaroxaban, sertraline et lévétiracétam. Patients, constantes et situations sont explicitement fictifs. Les exercices interrogent mécanisme, sécurité/interaction/surveillance puis cinétique, sans prescription individuelle. Les valeurs de demi-vie gardent leur contexte de spécialité/voie/population ; les effets fréquents du paracétamol injectable ne sont pas généralisés aux formes orales.

Le transversal ajoute cinq étapes autour de metformine, DFG fictif, association AINS–rivaroxaban, distinction de l’INR et suivi rénal. Quatre spécialités pédagogiques associées ; réponses et informations futures verrouillées. L’interaction utilise les deux RCP, sans recommander une ordonnance ou un changement de dose.

## Sources et accès

API actives : Medicaments API/Giygas (catalogue et copies RCP), PubChem (propriétés et SDF 3D), ChEMBL (identités structurales, mécanismes et cibles), Europe PMC, RxNorm, ClinicalTrials.gov et OpenFDA (métadonnées SPL et liens DailyMed, pas de sections cliniques). Chargements explicites, caches bornés, provenance/dates et gestion des erreurs. Pas de clé privée frontend.

Pharmacorama : quiz original sur demande, aucun import des questions ou scores. VIDAL : accès au site original, pas de monographies importées ; le widget testé ne fournit pas une API de données exploitable ici. Thériaque : accès original, pas de base obtenue ou redistribuée. DailyMed : lien, CORS bloquant observé. Les autres sources restent des références/liens lorsque leur intégration ou leurs droits ne sont pas établis.

Le registre ajoute CNPM, HAS, SFPC, Angers, PubMed, SwissADME, SwissTargetPrediction, ChemSpider, PILLY et Katzung. Références universitaires conservées sans reproduction de cours/ouvrages. L’intitulé BANM n’a pas été identifié comme une base autonome de pharmacologie : aucun service ni endpoint n’est inventé. Un résultat BIAM employant cet acronyme ne suffit pas à établir l’existence de la ressource demandée.

## Vérification et maintenance

`npm run build` revérifie les contenus importés et TypeScript. `npm run test` couvre modèles, scores, SM-2, stockage, imports/exports, sources et composants. `npm run test:e2e` couvre Chromium ordinateur/mobile et axe ; `npm run test:compat` couvre Firefox/WebKit. `npm run release:check` contrôle relations, provenance, build et motifs courants de secrets sans afficher les valeurs. Cette recherche n’est pas un audit de sécurité exhaustif.

Le visualiseur 3D est chargé sur demande et mis en cache par la PWA. Les avertissements de taille et d’eval de la dépendance sont documentés dans structures-3d.md ; aucune chaîne de callback ou donnée HTML utilisateur n’est exécutée. La conformité WCAG ne peut pas être certifiée par les seuls tests automatiques. Sauvegarder régulièrement les données personnelles : pas de synchronisation entre appareils, et réinitialiser le navigateur peut supprimer IndexedDB.

La validation médicale indépendante, l’exhaustivité des informations et les licences commerciales ne peuvent pas être déclarées obtenues par la livraison technique. Ces limites restent visibles et n’empêchent pas l’utilisation des moteurs pédagogiques et des contenus documentaires disponibles.

## Travail restant

Documenter les champs encore absents lorsqu’une source pertinente le permet ; étoffer la banque au niveau DFASM2 et faire relire les contenus indépendamment ; contrôler les critères d’accessibilité nécessitant un audit humain et des matériels réels. Les ressources encore indiquées comme liens ne sont pas des bases importées. La présence des moteurs, une couverture chiffrée des champs ou la réussite des tests logiciels ne suffit pas à déclarer ce travail terminé.

Seize rubriques supplémentaires de surveillance, précautions et pharmacologie sont détaillées dans [complement-surveillance.md](complement-surveillance.md). Les rappels de cible ont été rattachés à l’objectif mécanismes et distingués des exercices de sécurité.

La préparation de relecture (146 éléments, empreintes, contrôle de déclarations sans authentification ni élévation de statut), les comparaisons et les ajouts RCP sont détaillés dans [relecture-et-comparaisons.md](relecture-et-comparaisons.md).

Le complément de maintenance ajoute `review:diff` : comparaison de deux exports après vérification de leurs empreintes, bilan des ajouts/retraits/modifications, chemins JSON Pointer bornés et protection contre l’écrasement d’un dossier d’entrée. [Procédure de comparaison](comparer-les-revisions.md). Les tests couvrent les changements de références/corrections/statuts, les clés JSON réservées, les listes, le changement de version, l’ordre et les dossiers altérés. Un essai CLI sur le catalogue réel a retrouvé 146 éléments inchangés et le refus d’écrasement a été vérifié. Aucun contenu médical n’a été ajouté dans ce complément.
