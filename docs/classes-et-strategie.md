# Révision des classes et stratégie documentaire

## Pages de famille

Routes HashRouter `/classes/:id`, accessibles depuis les douze familles et la recherche globale. Saisie d’un nom de famille exact sans accents + Entrée ouvre la classe, distincte d’une fiche DCI. Classes inconnues : message explicite et retour au catalogue, sans route cassée.

Chaque page conserve les propriétés **par molécule**, avec cible, mécanisme, contre-indications, interactions et pièges pédagogiques. Sources, formulation, contexte et dates utilisent le même composant scientifique que les fiches. Aucun mécanisme, effet ou contre-indication n’est généralisé à tous les membres d’une famille à partir d’un seul exemple.

Progression : fiches réellement marquées étudiées dans IndexedDB, affichées après chargement seulement. Ce nombre n’est pas une mesure de maîtrise. Questions, cartes et dossiers associés sont comptés depuis les contenus actuels, sans statistiques simulées. Objectifs disponibles, liens filtrés vers fiches/QCM/examens/flashcards/dossiers et comparateur des deux à quatre premières molécules documentées. Les sous-classes et leur parent sont affichés lorsqu’un paquet autorisé les définit ; les molécules restent rattachées à leur classe directe.

Les filtres classe/spécialité des dossiers sont combinables ; changer une spécialité conserve le filtre de classe, et retirer la classe conserve la spécialité. Le lien vers les cartes initialise effectivement leur filtre de classe. Les exercices et dossiers restent de démonstration. Pages statiques utilisables hors ligne après précache, avec progression locale ; aucune API externe ne charge automatiquement des contenus supplémentaires.

## Metformine : deux niveaux documentaires

Un champ supplémentaire, `therapeuticStrategy`, relie l’indication du [RCP METFORMINE BGR 500 mg](https://base-donnees-publique.medicaments.gouv.fr/medicament/69916198/extrait) à une courte synthèse du [communiqué HAS DT2 du 6 juin 2024](https://www.has-sante.fr/jcms/p_3520515/fr/diabete-de-type-2-les-therapies-non-medicamenteuses-d-abord), consulté le 14 octobre 2026. Le communiqué insiste sur les mesures non médicamenteuses maintenues et l’individualisation selon les risques et comorbidités. Aucune règle universelle de première ligne ou décision individuelle n’est inventée. La synthèse ne remplace pas la recommandation complète.

Le PDF de recommandations et la page générale n’ont pas pu être récupérés avec l’outil de consultation lors de ce complément (erreur 502). Aucun contenu de ces documents non lus n’est attribué à la fiche. Le communiqué effectivement lu et le RCP déjà documenté sont les références du champ. La date de publication du communiqué est indiquée dans le repère ; sa date de mise à jour est inconnue, donc `sourceUpdatedAt: null`.

Synthèse originale brève, aucune reproduction de fiche, figure ou algorithme HAS. Décision éditoriale historique conservée dans `scripts/has-metformine.ts` ; ce n’est pas un actualiseur réseau ni un outil clinique. Version de la fiche metformine : 2026.10.14-3. Niveau : concordance documentaire, sans validation indépendante. **523 champs disponibles / 650 ; 127 absents.** Les autres champs ne sont pas remplis par cette nouvelle référence.
