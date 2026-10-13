# Importer des contenus autorisés

Deux formats sont séparés : la sauvegarde JSON personnelle (progression et séances, dans Paramètres) et le paquet documentaire publié avec le site (fiches, classes, questions, dossiers et cartes). Le second ne nécessite aucun serveur.

1. Préparer un paquet suivant `examples/contenus-exemple.json` et le schéma `src/domain/contentPack.ts`. Pour une nouvelle fiche, tous les champs sont présents ; ceux sans donnée sourcée utilisent le statut missing avec une raison explicite. Déclarer les sources et les droits de réutilisation. Référencer les classes, systèmes et spécialités existants ou les ajouter au paquet.
2. Dans Paramètres, vérifier le JSON et télécharger le paquet vérifié. Ce téléchargement prépare le fichier, sans installation immédiate ; les connaissances et droits déclarés ne sont pas validés par ce contrôle de format.
3. Dans le dépôt : `npm run content:validate -- chemin/paquet.json`, puis `npm run content:import -- chemin/paquet.json`. La commande remplace le paquet complémentaire `src/data/manual-content.json`, jamais le catalogue initial ni la progression personnelle. Conserver une copie du paquet précédent et utiliser des identifiants nouveaux si le sens d’un contenu change.
4. Exécuter `npm run test`, `npm run build`, `npm run test:e2e` ; publier les changements sur main pour déclencher GitHub Pages.

L’exemple contient un exercice mathématique fictif original, pas une prescription ou une donnée clinique. Son import dans la banque a été exécuté et vérifié, puis le paquet vide d’origine a été restauré pour la livraison.

Limites : 10 Mo de JSON, jusqu’à 1000 fiches, 10000 questions/cartes et 500 dossiers. Le format est strict, version 1. URLs de provenance HTTPS ; sources obligatoires pour les connaissances disponibles. Collisions avec les identifiants du catalogue initial refusées, références croisées contrôlées. Un import ne peut revendiquer une validation médicale indépendante : questions et dossiers sont demo, fiches et cartes documentary-summary. La compilation revérifie automatiquement le paquet courant.

Le paquet permet d’étendre les spécialités et systèmes sans changer les moteurs. Les API ne cherchent pas automatiquement des identifiants pour les nouvelles molécules : un CID PubChem documenté est nécessaire pour les propriétés et la 3D ; sans ce CID, le module ne s’affiche pas. Les recherches RxNorm, Europe PMC et ClinicalTrials.gov restent limitées aux noms anglais explicitement documentés dans leur adaptateur. Les séances conservent leurs copies ; l’import d’un nouveau catalogue n’efface pas une correction historique.

Ce mécanisme ne donne pas de droits supplémentaires sur VIDAL, Thériaque, Pharmacorama, des ouvrages ou des cours universitaires. Utiliser des synthèses originales sourcées ou des données dont la licence autorise effectivement la réutilisation.
