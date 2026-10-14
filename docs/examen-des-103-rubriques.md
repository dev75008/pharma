# Examen des 103 rubriques — 14 octobre 2026

Les 103 rubriques absentes du commit `823063f` ont été examinées individuellement. **78 ont été complétées : 53 synthèses documentaires et 25 créations pédagogiques (15 aides mémoire, neuf comparaisons, cinq rappels d’apixaban réunis dans un champ). Les 25 autres restent sans valeur établie dans les références consultées.** Leur motif précis et la référence examinée sont maintenant affichés et exportables. Cela ne prouve pas l’absence de la donnée dans toute la littérature.

Le corpus atteint 725 champs disponibles sur 750 : 665 rubriques documentaires et 60 aides pédagogiques au total. Ce décompte n’est pas une mesure de couverture du DFASM2, de fiabilité clinique ou de validation indépendante. Les quinze molécules, douze familles et onze dossiers fictifs sont conservés. Le champ de demi-vie de spironolactone rend disponible un exercice documentaire déjà défini, et les effets fréquents d’apixaban rendent disponible une carte déjà définie : 74 questions de démonstration et 61 cartes documentaires, soit 161 éléments exportables pour relecture.

## Traçabilité du lot

`src/data/completion-audit.json` conserve les 103 couples molécule/rubrique, leur résultat et leurs références. `scripts/complete-remaining-fields.ts` est un historique éditorial daté : il attend les 103 rubriques du lot initial et refuse de remplacer une valeur disponible. Il n’est pas un actualiseur à relancer. Les textes sont des paraphrases originales brèves ou des créations pédagogiques ; aucun cours, monographie, tableau ou questionnaire original n’est copié.

| Molécule | Rubriques complétées | Rubriques conservées absentes après examen |
|---|---:|---:|
| Bisoprolol | 3 | 2 |
| Ramipril | 4 | 1 |
| Losartan | 4 | 0 |
| Furosémide | 4 | 2 |
| Rivaroxaban | 6 | 0 |
| Clopidogrel | 4 | 2 |
| Amoxicilline | 3 | 1 |
| Metformine | 5 | 2 |
| Paracétamol | 4 | 4 |
| Ibuprofène | 2 | 2 |
| Prednisolone | 5 | 6 |
| Sertraline | 4 | 2 |
| Lévétiracétam | 5 | 0 |
| Apixaban | 16 | 0 |
| Spironolactone | 9 | 1 |

## Références et distinctions importantes

Les RCP de la BDPM restent la base des synthèses françaises, avec CIS, formulation, rubrique, date de consultation et date du document. Les champs de stratégie ajoutés décrivent le rôle réglementaire de la spécialité et son contexte ; ils ne constituent pas un classement de première ligne ou une recommandation française exhaustive. Le RCP historique de la sertraline reste explicitement signalé comme tel.

Pour l’apixaban, le [RCP européen ELIQUIS en anglais](https://www.ema.europa.eu/en/documents/product-information/eliquis-epar-product-information_en.pdf), pages 36–65 (5 mg), a été téléchargé pour lecture locale. La présentation du tableau de fréquences a été contrôlée visuellement. Le PDF original reste hors du dépôt et hors de la PWA. Les effets fréquents sélectionnés gardent le contexte adulte FANV/traitement TVP–EP ; on ne les transpose pas à la population pédiatrique. La date de révision connue reste absente.

Le [CNPM, Absorption](https://pharmacomedicale.org/pharmacologie/pharmacocinetique/36-etapes-du-devenir-du-medicament/74-absorption) définit la biodisponibilité IV à 100 %. Cette définition est appliquée seulement à la voie IV documentée des spécialités de furosémide et paracétamol ; elle ne renseigne pas une voie IM ou orale. Le [CNPM, Antidiabétiques](https://pharmacomedicale.org/medicaments/par-specialites/item/antidiabetiques-les-points-essentiels) décrit l’activation de l’AMPK : cette voie impliquée n’est pas présentée comme une cible unique ou une preuve de liaison directe de la metformine. Les mécanismes des anti-aldostérone et le CYP3A4 de la prednisolone proviennent de leurs pages CNPM respectives, citées par champ.

Trois paramètres de spironolactone viennent d’une lecture manuelle de [DailyMed, étiquetage américain daté du 4 février 2026, section 12.3](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ae0dcb4e-63df-459c-8e60-0caa817b8135). Les valeurs sont signalées comme américaines, avec les comprimés et métabolites concernés. Aucun transfert de posologie, indication ou équivalence avec BIOGARAN n’en est déduit. La hausse d’ASC avec les repas n’est pas une fraction absolue de biodisponibilité. Le connecteur DailyMed navigateur reste absent ; aucune notice complète n’est importée.

## Les 25 limites conservées

Les champs suivants restent `missing`, valeur `null`, vérification `unverified` :

- Bisoprolol : courbe dose–effet, CYP.
- Ramipril : CYP.
- Furosémide : CYP, activité de métabolites.
- Clopidogrel : courbe dose–effet, biodisponibilité absolue.
- Amoxicilline : CYP.
- Metformine : courbe dose–effet, CYP.
- Paracétamol : cible unique, type d’action moléculaire unique, courbe dose–effet, métabolite thérapeutique actif.
- Ibuprofène : courbe dose–effet, biodisponibilité absolue.
- Prednisolone : biodisponibilité, distribution, liaison protéique, métabolites actifs, adaptations rénale et hépatique chiffrées pour cette référence.
- Sertraline : courbe dose–effet, activité thérapeutique du métabolite décrit dans la rubrique consultée.
- Spironolactone : CYP.

Une valeur à dose fixe, une titration et une cinétique linéaire ne fournissent pas nécessairement une courbe dose–effet. Un taux d’absorption n’est pas une biodisponibilité absolue. Une demi-vie n’est pas un volume de distribution. Un métabolite toxique n’est pas automatiquement un métabolite thérapeutique actif. Une enzyme non citée n’est pas une preuve d’absence d’interaction. Ces distinctions expliquent les limites conservées.

Le modèle ajoute `absenceReview` aux champs absents : date, motif `not-reported` ou `uncertain`, références obligatoires. La preuve de l’examen ne transforme pas la valeur manquante en information scientifique validée. Le bilan JSON conserve les motifs et références. Les contenus de Révision portent `presentation: pedagogical`, avec une étiquette visible ; leurs faits sous-jacents gardent les sources, mais les moyens mnémotechniques ne deviennent pas des contenus officiels.

## Vérifications

182 tests unitaires puis un test supplémentaire de refus de source inconnue ont réussi ; trente parcours ciblés Chromium ordinateur/mobile et dix parcours ciblés Firefox/WebKit réussis ; compilation et contrôle de livraison réussis. Les vérifications couvrent notamment les valeurs laissées nulles, les sources des limites, les refus d’imports incohérents, les distinctions IV/oral et molécule/métabolites, les étiquettes pédagogiques et les exports. Le déploiement relance également les 183 tests unitaires et les parcours navigateur complets. Ces tests logiciels ne constituent pas une validation médicale indépendante.

Les IDs de progression, questions et cartes existants sont conservés ; les anciennes séances gardent leurs instantanés. Un export de relecture avant/après a été conservé localement. Les paramètres non établis pourront être renseignés seulement après découverte et contrôle d’une référence adaptée. L’élargissement du corpus et la relecture humaine qualifiée restent nécessaires.
