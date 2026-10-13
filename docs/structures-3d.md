# Conformères 3D PubChem

Documentation officielle : https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest, Full-record Retrieval, format SDF et record_type=3d ; visualiseur https://3dmol.org/doc/. Logiciel 3Dmol 2.5.5 sous BSD-3-Clause, licence conservée dans docs et dans public/licenses/3dmol.txt.

Endpoint vérifié : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2405/SDF?record_type=3d`. Réponse réelle HTTP 200 avec CORS `*`, 54 atomes et 54 liaisons. Fixture originale PubChem dans e2e/fixtures ; données structurales calculées et attribution PubChem, sans supposer des droits identiques pour toutes les annotations du site.

Chaque fiche avec un CID documenté propose un chargement volontaire. On vérifie le CID d’en-tête et la propriété PUBCHEM_COMPOUND_CID, un seul enregistrement SDF, format V2000/3D, tailles, coordonnées et liaisons. Un autre CID, une structure 2D, un fichier malformé ou une absence sont refusés. Conformère calculé, sans assimilation à une conformation expérimentale, à une cible ou à une formulation commerciale.

Rotation, zoom et recentrage par boutons clavier ; souris et toucher également disponibles. Nombre d’atomes et lien SDF constituent l’alternative textuelle. WebGL indisponible : erreur explicite et accès au fichier original. Un visualiseur partagé évite de multiplier les contextes WebGL lors des changements de fiches ; modèles nettoyés et ResizeObserver retiré à la fermeture.

Réseau : file PubChem partagée avec les propriétés, 1 requête/s localement, timeout 10 s, gestion de 429/503/Retry-After sans répétition automatique. IndexedDB v14 : conformers, cache 24 h, 20 structures. Copies téléchargées lisibles hors ligne ; une erreur conserve la copie ancienne avec sa date. Le cache n’entre pas dans la sauvegarde personnelle JSON.

Le code 3Dmol est un module séparé chargé sur demande, environ 574 Ko minifiés (164 Ko compressés), et précaché pour le hors ligne. Vite signale ce gros module ainsi que l’eval présent dans la distribution tierce. MEDREVISION n’utilise pas les callbacks textuels ou l’autochargement HTML de 3Dmol ; aucun HTML documentaire ou callback utilisateur ne lui est transmis. Les fichiers SDF sont validés, les documents HTML conservent leur nettoyage DOMPurify sans attributs data. Ces avertissements de dépendance sont documentés, pas cachés.
