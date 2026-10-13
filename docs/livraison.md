# Livraison technique MEDREVISION

Version préparée le 14 octobre 2026. L’application est une plateforme personnelle sans backend obligatoire, publiée par GitHub Actions avec routes HashRouter, stockage IndexedDB, PWA et sauvegardes locales.

Validation locale : **135 tests unitaires, 104 scénarios Chromium ordinateur/mobile et 42 parcours Firefox/WebKit réussis**. Audits axe sur 15 routes en clair/sombre dans les deux présentations, compilation TypeScript/Vite et contrôles de livraison réussis. npm audit : zéro vulnérabilité signalée au moment de la vérification ; ce résultat n’est pas une garantie générale de sécurité.

| Phase | Résultat livré |
|---|---|
| 1 | Architecture React/TypeScript, navigation, recherche globale, mobile, thèmes, PWA |
| 2 | Bibliothèque, classes, fiches sourcées, favoris, notes, historique, comparateur 2–4 et PDF par impression |
| 3 | Six formats de questions, entraînements, examens chronométrés, corrections, reprise et CSV ; 42 exercices de démonstration |
| 4 | 46 cartes documentaires, cartes personnelles, six types, SM-2 adapté, échéances et séances |
| 5 | Six dossiers progressifs fictifs de trois étapes, sources, réponses verrouillées, reprise et bilans |
| 6 | Statistiques réelles, planning, objectifs, thèmes, recommandations, séances quotidiennes et sauvegardes JSON validées |
| 7 | Registre complété, connecteurs publics documentés, RCP, chimie/propriétés/mécanismes/cibles, bibliographie, identifiants et études ; conformères 3D ; import légal de paquets à la compilation |
| 8 | Tests unitaires et navigateur, audits automatiques d’accessibilité, compatibilité Firefox/WebKit, vérifications de livraison et déploiement automatique |

## Périmètre documentaire

13 molécules et 12 familles ; 479 champs disponibles sur 650. Les 171 autres restent absents avec un motif. Les panneaux API enrichissent la consultation sans remplacer ces champs. La bibliothèque peut être étendue par paquets versionnés : fiches/classes/spécialités/systèmes, questions, cartes et dossiers. Les nouveaux exercices utilisent uniquement les champs disponibles avec leurs références ; statuts demo ou documentary-summary maintenus. Aucune génération médicale en ligne ni validation indépendante revendiquée.

Les dossiers supplémentaires couvrent amoxicilline, rivaroxaban, sertraline et lévétiracétam. Patients, constantes et situations sont explicitement fictifs. Les exercices interrogent mécanisme, sécurité/interaction/surveillance puis cinétique, sans prescription individuelle. Les valeurs de demi-vie gardent leur contexte de spécialité/voie/population ; les effets fréquents du paracétamol injectable ne sont pas généralisés aux formes orales.

## Sources et accès

API actives : Medicaments API/Giygas (catalogue et copies RCP), PubChem (propriétés et SDF 3D), ChEMBL (identités structurales, mécanismes et cibles), Europe PMC, RxNorm et ClinicalTrials.gov. Chargements explicites, caches bornés, provenance/dates et gestion des erreurs. Pas de clé privée frontend.

Pharmacorama : quiz original sur demande, aucun import des questions ou scores. VIDAL : accès au site original, pas de monographies importées ; le widget testé ne fournit pas une API de données exploitable ici. Thériaque : accès original, pas de base obtenue ou redistribuée. DailyMed : lien, CORS bloquant observé. Les autres sources restent des références/liens lorsque leur intégration ou leurs droits ne sont pas établis.

Le registre ajoute CNPM, HAS, SFPC, Angers, PubMed, SwissADME, SwissTargetPrediction, ChemSpider, PILLY et Katzung. Références universitaires conservées sans reproduction de cours/ouvrages. L’intitulé BANM n’a pas été identifié comme une base autonome de pharmacologie : aucun service ni endpoint n’est inventé. Un résultat BIAM employant cet acronyme ne suffit pas à établir l’existence de la ressource demandée.

## Vérification et maintenance

`npm run build` revérifie les contenus importés et TypeScript. `npm run test` couvre modèles, scores, SM-2, stockage, imports/exports, sources et composants. `npm run test:e2e` couvre Chromium ordinateur/mobile et axe ; `npm run test:compat` couvre Firefox/WebKit. `npm run release:check` contrôle relations, provenance, build et motifs courants de secrets sans afficher les valeurs. Cette recherche n’est pas un audit de sécurité exhaustif.

Le visualiseur 3D est chargé sur demande et mis en cache par la PWA. Les avertissements de taille et d’eval de la dépendance sont documentés dans structures-3d.md ; aucune chaîne de callback ou donnée HTML utilisateur n’est exécutée. La conformité WCAG ne peut pas être certifiée par les seuls tests automatiques. Sauvegarder régulièrement les données personnelles : pas de synchronisation entre appareils, et réinitialiser le navigateur peut supprimer IndexedDB.

La validation médicale indépendante, l’exhaustivité des informations et les licences commerciales ne peuvent pas être déclarées obtenues par la livraison technique. Ces limites restent visibles et n’empêchent pas l’utilisation des moteurs pédagogiques et des contenus documentaires disponibles.
