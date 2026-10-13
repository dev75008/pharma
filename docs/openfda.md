# Métadonnées OpenFDA

Connecteur vérifié le 14 octobre 2026, depuis l’origine GitHub Pages avec Chromium : appel réel sans clé HTTP 200, 216 résultats pour AMOXICILLIN et cinq métadonnées reçues. Les tests automatisés emploient une projection de cette réponse réelle, sans dépendre du réseau.

Documentation officielle : [drug label](https://open.fda.gov/apis/drug/label/), [champs](https://open.fda.gov/apis/drug/label/searchable-fields/), [paramètres](https://open.fda.gov/apis/query-parameters/), [quotas](https://open.fda.gov/apis/authentication/), [licence](https://open.fda.gov/license/) et [conditions](https://open.fda.gov/terms/).

GET `https://api.fda.gov/drug/label.json` ; paramètres `search=openfda.generic_name.exact:"AMOXICILLIN"`, `limit=5`, `sort=effective_time:desc`. Les noms anglais des 13 molécules sont explicitement définis. Pas de traduction, rapprochement CIS/CIP/NDC ou identité structurale inférés. Les résultats peuvent couvrir plusieurs distributeurs ou formulations ; ils ne prouvent pas une autorisation française ni une approbation FDA.

Le panneau affiche uniquement id/set_id/version/effective_time, noms génériques et commerciaux, fabricant/distributeur, voies, substances et type de produit. Les autres propriétés JSON sont éliminées lors de la validation. Aucun texte de monographie, indication, dose ou déclaration d’effet indésirable n’est copié. Les liens DailyMed sont construits uniquement à partir d’un UUID set_id contrôlé ; un lien réel a été ouvert et vérifié. DailyMed reste externe et n’est pas chargé dans une iframe.

Date de mise à jour de la base (`meta.last_updated`), date SPL (`effective_time`) et date de téléchargement restent distinctes. Aucun résultat NOT_FOUND signifie seulement absence de cette recherche exacte. Les erreurs HTTP/réseau/schéma ne deviennent pas une absence documentaire. Les noms exacts reçus et UUID sont vérifiés ; les doublons sont rejetés. React affiche les valeurs comme texte, sans interprétation HTML.

Chargement explicite, données transmises nom/adresse IP, credentials omit, aucune clé secrète. File locale sérialisée à une requête/s, délai 10 s, traitement 429/503/Retry-After sans relance automatique. Quotas officiels sans clé : 240/minute et 1000/jour/IP, partagés avec les autres usages de la même IP. IndexedDB v15, cache 24 h/30 recherches et déduplication ; copie périmée conservée avec avertissement en cas de panne, consultation hors ligne uniquement après téléchargement. Cache exclu des sauvegardes de progression.

Attribution FDA visible. Données openFDA annoncées sous CC0, sauf exceptions explicitement marquées ; aucune reprise de GMDN, texte tiers ou texte intégral de notice. L’accès respecte les conditions du service. Le connecteur ne modifie jamais les fiches cliniques françaises et ne génère aucune question médicale.
