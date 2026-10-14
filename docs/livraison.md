# Livraison technique MEDREVISION

Version préparée le 14 octobre 2026. L’application est une plateforme personnelle sans backend obligatoire, publiée par GitHub Actions avec routes HashRouter, stockage IndexedDB, PWA et sauvegardes locales. Ce bilan décrit les moteurs livrés et leurs limites ; il ne déclare pas l’ensemble du cahier des charges achevé ou médicalement validé.

Validation : **148 tests unitaires, 118 scénarios Chromium ordinateur/mobile et 56 parcours Firefox/WebKit réussis**. Audits axe sur 17 routes en clair/sombre dans les deux présentations, compilation TypeScript/Vite et contrôles de livraison réussis. Ces vérifications ne constituent pas un audit général de sécurité ou une validation médicale.

| Phase | Résultat livré |
|---|---|
| 1 | Architecture React/TypeScript, navigation, recherche globale, mobile, thèmes, PWA |
| 2 | Bibliothèque, pages de famille et sous-classes, fiches sourcées, favoris, notes, historique, progression réelle, navigation pédagogique liée, comparateur 2–4 et PDF par impression |
| 3 | Six formats, filtres classe/spécialité/objectif, mélange optionnel conservé à la reprise, entraînements, examens chronométrés, corrections et CSV ; 43 exercices de démonstration |
| 4 | 47 cartes documentaires, cartes personnelles, six types, SM-2 adapté, échéances et séances |
| 5 | Sept dossiers progressifs fictifs : six de trois étapes et un transversal de cinq, sources, réponses verrouillées, reprise et bilans |
| 6 | Statistiques réelles, planning, objectifs, thèmes, recommandations, séances quotidiennes et sauvegardes JSON validées |
| 7 | Registre, connecteurs publics documentés, RCP, chimie/propriétés/mécanismes/cibles, bibliographie, identifiants, études et métadonnées américaines OpenFDA ; conformères 3D ; import légal de paquets à la compilation |
| 8 | Tests unitaires et navigateur, audits automatiques d’accessibilité, compatibilité Firefox/WebKit, vérifications de livraison et déploiement automatique |

## Périmètre documentaire

13 molécules et 12 familles ; 523 champs disponibles sur 650. Les 127 autres restent absents avec un motif. Les panneaux API enrichissent la consultation sans remplacer ces champs. La bibliothèque peut être étendue par paquets versionnés : fiches/classes/spécialités/systèmes, questions, cartes et dossiers. Les nouveaux exercices utilisent uniquement les champs disponibles avec leurs références ; statuts demo ou documentary-summary maintenus. Aucune génération médicale en ligne ni validation indépendante revendiquée. Les ajouts RCP/CNPM et les 13 correspondances ChEMBL exactes sont détaillés dans enrichissement-documentaire-14-octobre.md ; le complément RCP/HAS de la metformine et les pages de classe dans classes-et-strategie.md.

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
