# Comparaisons et préparation de relecture — 14 octobre 2026

Quinze rubriques auparavant absentes ont été documentées dans le premier lot : sept synthèses RCP, six comparaisons issues de champs existants et deux représentations 2D PubChem. Le complément [structures-3d.md](structures-3d.md) documente ensuite quinze conformères calculés inclus : le corpus atteignait alors 628 champs sur 750. Le [lot prioritaire](priorite-documentaire.md) avait porté ce bilan à 647/750. L’[examen des 103 rubriques](examen-des-103-rubriques.md) porte le bilan à 725/750 (dont 60 aides pédagogiques), avec 25 limites documentaires conservées. Les limites ou mécanismes non établis ne sont pas remplacés par des suppositions.

## Documentation effectivement consultée

- [FUROSEMIDE ACCORD injectable](https://base-donnees-publique.medicaments.gouv.fr/medicament/65449480/extrait), RCP du 22 novembre 2024 : 4.2 et 5.1. Voie IV, unités de créatinine sérique et débit conservés ; délai d’effet distinct de demi-vie. Aucune biodisponibilité orale déduite d’une solution injectable.
- [RAMIPRIL BIOGARAN](https://base-donnees-publique.medicaments.gouv.fr/medicament/61599041/extrait), RCP du 6 juin 2024 : contexte autorisé d’hypertension, 4.1.
- [SERTRALINE VIATRIS GENERIQUES](https://base-donnees-publique.medicaments.gouv.fr/medicament/63288007/extrait), RCP du 19 juin 2023 : 5.1 et 4.9. Observations humaines/animales distinctes ; description qualitative de distribution non transformée en valeur numérique.

Les comparaisons IEC/ARA2, diurétiques et anti-Xa réutilisent les mécanismes documentés, avec les preuves originales et leurs dates. Elles ne démontrent pas une interchangeabilité de doses ou une supériorité clinique. `scripts/enrich-comparisons.ts` conserve la trace éditoriale et refuse un remplacement de rubrique disponible.

Les PNG calculés PubChem d’apixaban CID 10182969 et spironolactone CID 5833 sont conservés dans `public/structures`. `scripts/prepare-additional-structures.ts` vérifie les réponses PNG, les CID documentés et l’absence de modification concurrente du catalogue. Les images sont précachées par la PWA, sans appel PubChem à la consultation de la fiche. Les conformères 3D disposent maintenant d’une copie incluse et d’une actualisation API distinctes ; aucune géométrie expérimentale n’est revendiquée.

La recherche d’une DCI exacte privilégie désormais sa fiche, même lorsqu’une autre fiche cite cette DCI dans une comparaison. La recherche par mécanisme ou indication couvre les champs propres à la molécule ; les textes comparatifs décrivant d’autres molécules sont exclus de cet index pour éviter de leur attribuer une cible étrangère. Les comparaisons restent visibles dans les fiches et le comparateur. Les composants de champs immuables sont mémorisés pour éviter de reconstruire toutes les références lors de la saisie d’une note ; aucun résultat de benchmark n’est revendiqué.

Neuf nouveaux exercices, trois cartes comparatives et un dossier AOMI à quatre étapes : total 65 questions, 55 cartes et 11 dossiers. Le dossier interroge le choix du RCP pertinent, la prodrogue, une interaction et un contrôle contextualisé ; patient fictif, pas d’ordonnance réelle. Exercices `demo`, contenus `documentary-summary` ; pas de validation indépendante obtenue.

## Dossier de relecture

La page Sources exporte un JSON comprenant les 161 éléments actuels du corpus (15 fiches, 74 questions, 61 cartes, 11 dossiers), leurs sources, versions et empreintes SHA-256. Les notes, résultats, favoris et cartes personnelles sont exclus. L’empreinte identifie un contenu ; elle ne prouve ni véracité médicale, ni identité du rédacteur, ni date authentifiée. Les réserves documentaires présentes dans les fiches font partie du contenu soumis à l’empreinte.

Le script local offre les mêmes fonctions :

```powershell
npm run review:export
npm run review:check -- review/rapport.json review/packet.json
```

Le dossier est dans `review/packet.json` par défaut. Le répertoire `review/` est ignoré par Git : aucune déclaration personnelle de relecteur publiée automatiquement.

Un relecteur humain qualifié doit lire les textes, sources, propositions, corrections, périmètres cliniques et objectifs. Son rapport doit conserver exactement le `packetHash` et les `contentHash` du dossier examiné. Les décisions peuvent couvrir seulement une partie des éléments. Le vérificateur refuse une modification de dossier, une décision inconnue/dupliquée, une date incompatible ou un catalogue courant différent.

Format d’un rapport à compléter réellement, exemple volontairement **invalide et non attesté** :

```json
{
  "schemaVersion": 1,
  "packetHash": "A_REPRENDRE_DU_DOSSIER",
  "reviewedAt": "AAAA-MM-JJ",
  "reviewer": {
    "name": "A compléter",
    "qualification": "A compléter",
    "affiliation": "A compléter",
    "independenceDeclared": false
  },
  "decisions": [
    {
      "kind": "question",
      "id": "IDENTIFIANT_DU_DOSSIER",
      "contentHash": "EMPREINTE_DU_CONTENU",
      "decision": "changes-requested",
      "comment": "Commentaire argumenté à rédiger après lecture réelle."
    }
  ]
}
```

Un rapport compatible reste une déclaration, sans authentification d’identité, qualification ou indépendance. Aucune donnée ou statut scientifique n’est modifié par `review:check`. Publier ultérieurement une validation demande une procédure éditoriale explicite et une attestation vérifiable ; l’export seul n’accomplit pas la validation médicale.
