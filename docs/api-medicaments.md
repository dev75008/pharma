# Catalogue BDPM via Medicaments API / Giygas

## Vérification du service — 12 octobre 2026

Documentation : [medicaments-api.giygas.dev](https://medicaments-api.giygas.dev/) et [documentation interactive](https://medicaments-api.giygas.dev/docs). Code serveur : [Giygas/medicaments-api](https://github.com/giygas/medicaments-api). Le service est indépendant du ministère ; il redistribue les fichiers administratifs de la Base de données publique des médicaments. Il ne remplace pas le RCP pour les indications, contre-indications, posologies, interactions ou données de pharmacocinétique. Aucun endpoint ni accès VIDAL/Thériaque n’est utilisé par cet adaptateur.

La documentation décrit l’accès sans authentification, GET/OPTIONS, des réponses JSON et une limite de 1000 tokens par IP avec recharge de 3 tokens/s. Coût annoncé : recherche par nom 50 tokens, recherche CIS/CIP 10 tokens. Elle annonce une limite de 250 résultats par recherche. Les anciennes routes ont été supprimées ; seules les routes v1 documentées sont employées.

Vérification réelle depuis Chromium sur `https://dev75008.github.io/pharma/` : GET `/v1/medicaments/60524826` répond HTTP 200. CORS autorise l’appel depuis GitHub Pages ; les en-têtes accessibles dans le navigateur comprennent Content-Type, Cache-Control et Last-Modified. La réponse testée indiquait `max-age=14400` et `Last-Modified: Mon, 12 Oct 2026 18:00:01 GMT`. Ce Last-Modified représente une date annoncée par le service, **pas** la date d’un RCP ni une vérification indépendante des fichiers amont. ETag n’est pas exposé au JavaScript : pas de requête conditionnelle personnalisée ni de tentative de forcer un préflight. Des appels Python ont parfois reçu HTTP 403 ; le connecteur gère donc aussi les indisponibilités et ne suppose pas une disponibilité permanente.

La réponse `/health` testée annonçait une synchronisation au 12 octobre 2026 à 18:00:01 UTC. Cette observation n’est pas une garantie de fraîcheur individuelle ni de SLA ; aucun chiffre de performance marketing n’est repris comme performance mesurée de MEDREVISION. L’application n’appelle pas cet endpoint pour chaque recherche.

## Licence et attribution

Le service annonce un logiciel serveur sous GNU AGPL v3 et des données sous les conditions BDPM. Notre adaptateur est une implémentation cliente originale de la documentation REST ; aucun code serveur n’est repris ou redistribué.

Les [fichiers téléchargeables BDPM](https://base-donnees-publique.medicaments.gouv.fr/telechargement) sont accompagnés d’une [Licence Ouverte Etalab](https://base-donnees-publique.medicaments.gouv.fr/docs/telechargement/licence_bdpm.pdf), avec attribution et information sur les dates. Les valeurs réglementaires reçues sont conservées sans réécriture dans le cache ; l’interface indique BDPM et l’intermédiaire Giygas, la récupération, la synchronisation annoncée ou son absence, et un lien vers la réponse API et la fiche BDPM originale. Cette réutilisation ne revendique aucune caution ministérielle. Les libellés affichés ne constituent pas une synthèse clinique validée.

Le champ `prix` peut valoir 0 quand la source ne renseigne pas de prix, et le service annonce un passage à null après le 31 décembre 2026. Le schéma accepte les deux cas ; l’interface affiche « Non renseigné », jamais « Gratuit ». Des conditions de prescription absentes ne signifient pas vente libre.

## Architecture et fonctionnement

- `src/data/adapters/medicamentsApi.ts` : modèles TypeScript/Zod, normalisation de la requête, contrôle du CIS/CIP retourné et des CIS imbriqués, appels HTTPS documentés, délai maximal de 10 secondes, refus de réponses HTML/incohérentes, gestion 400/404/429/5xx et réseau.
- `src/storage/catalog.ts` : requêtes identiques simultanées regroupées ; cache IndexedDB versionné, 50 recherches maximum, contrôle du schéma et de l’identité avant lecture. Une recherche valide en cache évite un appel réseau.
- `src/features/library/RegulatoryCatalog.tsx` : recherche explicite par nom/CIS/CIP, résultats affichés par lots de 20, vue détaillée et provenance. Chaque fiche locale offre un complément pour le **CIS exact** de son RCP. Aucun rapprochement clinique approximatif par nom commercial n’est effectué.
- IndexedDB v5 ajoute uniquement la table `apiCache`, sans modifier les tables de progression, résultats, cartes et notes. Le catalogue n’augmente pas le nombre de fiches étudiées et ne crée pas de questions ou flashcards médicales automatiquement.

La durée locale respecte Cache-Control, plafonnée à une heure pour les noms et quatre heures pour les codes, en tenant compte de Age s’il est accessible. Une actualisation explicite force la lecture réseau. Hors ligne, la copie déjà téléchargée reste utilisable ; une copie expirée est signalée. Lors d’une erreur d’actualisation, la copie antérieure garde ses valeurs et sa **date de récupération initiale**. Une synchronisation annoncée de plus de 48 heures déclenche une alerte technique ; ce seuil n’est pas une garantie de validité médicale. Sans copie, un message explicite indique que la recherche n’a pas été téléchargée.

Les appels utilisent `credentials: omit`, `cache: no-store` (le cache applicatif explicite est dans IndexedDB) et aucun secret. Ainsi, une actualisation n’est pas masquée par un deuxième cache HTTP du navigateur. Il n’y a pas de chargement de la base complète de 23 Mo, de polling ou de recherche réseau à chaque frappe. Après HTTP 429, le délai Retry-After accessible est respecté ; à défaut, un délai local de 30 secondes s’applique, sans boucle de retry. Le nombre de tokens partagé avec d’autres utilisateurs de la même IP reste géré par le service.

## Confidentialité et hors ligne

Au clic de recherche/chargement, le service reçoit l’adresse IP et les termes ou codes recherchés. Il annonce conserver l’IP complète 90 jours puis l’anonymiser, et supprimer après un an. L’interface avertit de cet appel au service tiers. Aucun résultat d’examen, note, identifiant ou donnée de patient n’est envoyé. Seules les recherches consultées sont disponibles hors ligne ; les monographies distantes et liens vers les RCP ne sont pas téléchargés par ce module. La réinitialisation du navigateur peut supprimer les copies.

## Vérification et maintenance

Les tests utilisent une réponse réellement collectée (voir `e2e/fixtures/README.md`), avec des scénarios techniques synthétiques d’erreur ; la CI ne dépend pas de l’API externe. Tests : validation de la réponse et du CIS/CIP, absences, prix 0/null, cache après réouverture, échec d’actualisation, hors ligne, requêtes concurrentes, throttling, navigation ordinateur/mobile. Une vérification manuelle distincte confirme le service réel et CORS depuis le navigateur.

Pour maintenir l’intégration, vérifier les annonces et schémas du service, conserver ses routes v1 documentées, collecter une réponse réelle attribuée et exécuter `npm run test`, `npm run build`, `npm run test:e2e`. En cas de rupture de contrat, refuser les nouvelles données et conserver une ancienne copie datée ou un message d’indisponibilité. Aucune donnée réglementaire n’écrase automatiquement une synthèse clinique.

## Résultats des vérifications

- 59 tests unitaires réussis ; compilation TypeScript/Vite réussie.
- 40 tests navigateur réussis (ordinateur et mobile), dont les nouveaux parcours catalogue, cache hors ligne, CIS/CIP, panne, 429 et complément réglementaire sans modification des synthèses cliniques.
- Essai manuel de l’application avec l’API **réelle**, dans un contexte Chromium mobile isolé : CIS 60524826, composition et détails affichés, un seul appel réseau, aucun débordement horizontal ; rechargement et consultation hors ligne de la copie enregistrée réussis. Les données personnelles de l’utilisateur n’ont pas été utilisées pour ces vérifications.
- Accès direct depuis l’origine GitHub Pages confirmé HTTP 200, y compris avec `cache: no-store`. La CI refait les vérifications automatisées avant le déploiement.

## RCP, notices et parcours optimisés — 12 octobre 2026

La documentation du [dépôt Giygas](https://github.com/Giygas/medicaments-api/blob/771006f05321d8db9f2686956e33be36225ea0e8/docs/RCP.md), consultée au commit `771006f05321d8db9f2686956e33be36225ea0e8`, décrit `/v1/medicaments/{cis}/rcp` et `/notice`. Ces routes répondent effectivement HTTP 200 depuis GitHub Pages pour le CIS 60524826. Les champs documentaires comprennent identité, type, titre, attribution ANSM, date `miseAJour` et rubriques HTML. Le RCP réel consulté possède 27 rubriques et porte la date source du 20 octobre 2025 ; la notice répond également 200. La page d’accueil du service ne mentionnait pas ces fonctionnalités lors de la première intégration réglementaire.

L’éditeur annonce ces documents réutilisables sous licence Etalab 2.0 avec attribution et date. Le rendu conserve les valeurs et l’intégralité du texte de chaque rubrique reçue ; les données ne sont pas réécrites par une IA, ni injectées dans les synthèses locales comme une validation indépendante. L’interface affiche `ANSM - Base de données publique des médicaments`, la date source, la date de récupération et les liens vers la réponse et la BDPM originale. Les références des licences BDPM indiquées plus haut restent distinctes de cette déclaration de l’éditeur sur les documents.

**Limite importante documentée dans le code source :** le service conserve durablement ses RCP/notices et ne relit pas automatiquement l’ANSM à chaque requête. Le Last-Modified documentaire représente la mise en cache, pas la date du texte. Un nouveau téléchargement dans MEDREVISION n’est donc pas une preuve de mise à jour amont. Cette limite est affichée à proximité du document ; le lien vers la version courante BDPM demeure accessible. Une absence API peut également résulter de son cache négatif ; elle n’est pas présentée comme une absence certaine de RCP sur la BDPM.

L’adaptateur `ansmDocuments.ts` valide le CIS exact, le type, l’attribution, la date, l’unicité des identifiants et la taille des rubriques. Le cache IndexedDB v6 ajoute `apiDocuments`, limite les copies à 20 documents et leur durée de validité technique à une heure, même lorsque l’API réelle annonce quatre heures. Les valeurs périmées peuvent être consultées hors ligne avec leur date ; une erreur de relecture ne renouvelle pas la date de l’ancienne copie. Les requêtes simultanées identiques sont regroupées. La temporisation HTTP et la gestion 429 sont communes au catalogue et aux documents, sans boucle de réessai.

Le HTML est assaini une deuxième fois par DOMPurify côté client : pas de script, image, iframe, attribut événementiel ou lien exécutable ; tableaux, listes, titres et texte conservés. Le renderer et DOMPurify sont des modules chargés à la demande ; DOMPurify est séparé de KaTeX pour éviter de charger le moteur mathématique pour lire un RCP. Les modules précachés de la PWA permettent le rendu hors ligne des documents déjà téléchargés.

Parcours : navigation commune fiches/catalogue ; sélection CIS et vue documentaire dans l’adresse ; retour navigateur/résultats sans nouvel appel ; recherches récentes locales ; résultats conservés pendant une actualisation de la même recherche ; index local de recherche mis en mémoire et invalidé lorsque la version documentaire change ; clavier Entrée/Échap et fermeture de la recherche globale à la navigation ou au clic extérieur. Les informations administratives sont repliées et les documents accessibles dans leur vue dédiée.

Vérifications locales : 65 tests unitaires réussis ; suite navigateur existante de 40 scénarios réussie, puis 14 scénarios catalogue/documents réussis sur ordinateur/mobile. Le serveur de test compile sans erreur TypeScript. Vérification distincte avec l’API réelle : RCP à 27 rubriques, lecture de 5.2 sur mobile, absence de débordement horizontal et relecture hors ligne réussie. La CI relance la suite complète de 46 scénarios avant publication.
