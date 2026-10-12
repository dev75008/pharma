# Enrichissement de la bibliothèque — 12 octobre 2026

13 fiches, 50 champs chacune. Passage de 141 à 479 champs documentés sur 650 : 247 champs cliniques, 78 champs chimiques (dont 13 images 2D), 13 sélections de cinq points essentiels. Chaque ajout conserve ses sources, rubriques/CID, contexte, date de consultation et mise à jour connue. Aucune validation médicale indépendante n’est annoncée.

Les 171 champs restants comprennent des informations non établies dans le RCP consulté, des adaptations à vérifier, des comparaisons/pièges/mnémotechniques à rédiger et relire, des correspondances ChEMBL et la visualisation 3D non implémentée. La raison de chaque absence est maintenant lisible, sans dépendre d’une infobulle.

Aucun accès automatique à VIDAL ou Thériaque n’a été obtenu : leur consultation externe reste indépendante des synthèses locales. Les images et propriétés PubChem sont disponibles hors ligne une fois la PWA téléchargée. La mention molécule/sel/hydrate est visible pour les champs chimiques.

Vérifications effectuées : 45 tests unitaires réussis ; compilation TypeScript/Vite réussie ; suite navigateur de 32 scénarios : 30 réussis lors du premier passage, 2 sélecteurs devenus ambigus après ajout des cinq points essentiels corrigés, puis les 2 scénarios concernés réussis lors de la relance ciblée. Le nouvel essai des propriétés chimiques, du contexte molécule/sel et des images 2D hors ligne passe sur ordinateur et mobile. La CI relance toute la suite avant déploiement. Ces tests vérifient le logiciel et les contraintes de provenance, pas une validation clinique indépendante.

Correction complémentaire : les notes personnelles sont initialisées une seule fois par ouverture de fiche, pour éviter qu’un instantané local encore ancien remplace le texte juste enregistré. Test de régression réussi et parcours sauvegarde/rechargement réussi sur ordinateur et mobile.
