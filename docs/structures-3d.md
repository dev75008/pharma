# Conformères 3D PubChem

## Copies incluses dans la version du 14 octobre 2026

Les quinze CID documentés ont chacun fourni un conformère calculé vérifié. `scripts/prepare-conformers.ts` conserve les SDF dans `public/conformers/*.txt` et un manifeste versionné dans `src/data/bundled-conformers.json` : CID, URL originale, date de collecte, nombres d’atomes/liaisons et SHA-256. Les fichiers TXT sont précachés par la PWA. Les champs structure3d sont désormais disponibles avec leur provenance, sans assimilation à une donnée clinique ou expérimentale.

Le bouton **Afficher le conformère inclus** lit cette copie sur le site de l’application, sans requête PubChem. Le visualiseur réutilise le même moteur ; un contrôle vérifie empreinte, CID et graphe avant affichage. Les fins de ligne Windows/Unix sont normalisées pour l’empreinte. La date de collecte du fichier reste inchangée : ouvrir une copie ne constitue pas une nouvelle consultation de PubChem. La date de mise à jour à la source reste inconnue, et une copie de plus de 24 heures est signalée ancienne.

Le chargement/actualisation API reste une action distincte, avec cache IndexedDB et gestion des indisponibilités décrits ci-dessous. La présence d’une copie dans le dépôt ne garantit pas le hors-ligne avant le premier précache réussi, ni une disponibilité permanente des serveurs externes. WebGL indisponible : accès textuel et téléchargement SDF conservés.

La structure d’un composé PubChem ne démontre ni identité de sel/hydrate/formulation, ni conformation liée à une cible, ni efficacité thérapeutique. La vérification d’intégrité n’authentifie pas un relecteur et ne valide pas des informations médicales.

Documentation officielle : https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest, Full-record Retrieval, format SDF et record_type=3d ; visualiseur https://3dmol.org/doc/. Logiciel 3Dmol 2.5.5 sous BSD-3-Clause, licence conservée dans docs et dans public/licenses/3dmol.txt.

Endpoint vérifié : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2405/SDF?record_type=3d`. Réponse réelle HTTP 200 avec CORS `*`, 54 atomes et 54 liaisons. Fixture originale PubChem dans e2e/fixtures ; données structurales calculées et attribution PubChem, sans supposer des droits identiques pour toutes les annotations du site.

Chaque fiche avec un CID documenté propose un chargement volontaire. On vérifie le CID d’en-tête et la propriété PUBCHEM_COMPOUND_CID, un seul enregistrement SDF, format V2000/3D, tailles, coordonnées et liaisons. Un autre CID, une structure 2D, un fichier malformé ou une absence sont refusés. Conformère calculé, sans assimilation à une conformation expérimentale, à une cible ou à une formulation commerciale.

Rotation, zoom et recentrage par boutons clavier ; souris et toucher également disponibles. Nombre d’atomes et lien SDF constituent l’alternative textuelle. WebGL indisponible : erreur explicite et accès au fichier original. Un visualiseur partagé évite de multiplier les contextes WebGL lors des changements de fiches ; modèles nettoyés et ResizeObserver retiré à la fermeture.

Réseau : file PubChem partagée avec les propriétés, 1 requête/s localement, timeout 10 s, gestion de 429/503/Retry-After sans répétition automatique. IndexedDB v14 : conformers, cache 24 h, 20 structures. Copies téléchargées lisibles hors ligne ; une erreur conserve la copie ancienne avec sa date. Le cache n’entre pas dans la sauvegarde personnelle JSON.

Le code 3Dmol est un module séparé chargé sur demande, environ 574 Ko minifiés (164 Ko compressés), et précaché pour le hors ligne. Vite signale ce gros module ainsi que l’eval présent dans la distribution tierce. MEDREVISION n’utilise pas les callbacks textuels ou l’autochargement HTML de 3Dmol ; aucun HTML documentaire ou callback utilisateur ne lui est transmis. Les fichiers SDF sont validés, les documents HTML conservent leur nettoyage DOMPurify sans attributs data. Ces avertissements de dépendance sont documentés, pas cachés.
