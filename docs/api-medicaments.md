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
