import {drugs} from './drugs';
import type {FieldKey, Question} from '../domain/models';
function exercise(id: string, drugId: string, field: FieldKey, statement: string, options: [string, boolean, string][], correction: string, objective = 'safety'): Question {
  const drug = drugs.find(d => d.id === drugId)!;
  const reference = drug.fields[field];
  if (reference.status !== 'available') throw Error('Champ de référence absent : ' + id);
  return {id, type: 'qrm', statement, drugIds: [drugId], classIds: [drug.classId], difficulty: 2,
    options: options.map(([text, correct, explanation], i) => ({id: String.fromCharCode(97 + i), text, correct, explanation})),
    correction, objectiveIds: [objective], evidence: reference.evidence, validationStatus: 'demo'};
}
export const priorityQuestions: Question[] = [
  exercise('bisoprolol-formulation-indication', 'bisoprolol', 'clinicalContexts', 'Lecture du RCP BISOPROLOL TEVA 10 mg : quelles conclusions respectent cette formulation ?', [
    ['HTA et angor stable sont documentés.', true, 'Indications de cette spécialité.'],
    ['Ce dosage est adapté d’emblée à la titration de toute insuffisance cardiaque chronique.', false, 'Le RCP exclut cet usage pour ce dosage.'],
    ['Toutes les formulations ont nécessairement les mêmes indications.', false, 'La formulation doit être conservée.'],
  ], 'Distinguer la DCI des indications de la spécialité consultée.'),
  exercise('ibuprofene-age-poids', 'ibuprofene', 'clinicalContexts', 'Spécialité IBUPROFENE ZENTIVA CONSEIL 200 mg : quels critères sont documentés ?', [
    ['Adolescent : au moins 12 ans.', true, 'Critère d’âge.'],
    ['Adolescent : au moins 40 kg.', true, 'Critère pondéral associé.'],
    ['Un seul des deux critères suffit automatiquement.', false, 'Le contexte exige âge et poids.'],
  ], 'Ces critères ne s’étendent pas automatiquement aux autres présentations.'),
  exercise('ibuprofene-cyp2c9', 'ibuprofene', 'cyp', 'Quelle interaction enzymatique est décrite pour l’ibuprofène ?', [
    ['Il est substrat du CYP2C9.', true, 'Enzyme documentée au RCP.'],
    ['Inhiber cette enzyme peut augmenter son exposition.', true, 'Interaction décrite.'],
    ['Une inhibition garantit une baisse de son exposition.', false, 'Cela inverse l’interaction documentée.'],
  ], 'Une interaction enzymatique ne suffit pas à calculer une dose individuelle.', 'kinetics'),
  exercise('ibuprofene-surveillance-k', 'ibuprofene', 'biologicalMonitoring', 'Dans une vignette fictive, ibuprofène et IEC sont mentionnés. Quel contrôle est documenté ?', [
    ['Kaliémie.', true, 'Association à risque d’hyperkaliémie.'],
    ['Aucun contrôle lié à cette association.', false, 'Le RCP comporte une surveillance.'],
    ['Un calendrier universel pour toutes les prises peut être déduit.', false, 'Le résumé ne fournit pas ce calendrier.'],
  ], 'Le contrôle est contextualisé ; la vignette ne recommande pas cette association.'),
  exercise('amoxicilline-indication-recommandation', 'amoxicilline', 'clinicalContexts', 'Une indication figure au RCP d’amoxicilline. Que peut-on en conclure ?', [
    ['Les recommandations officielles d’antibiothérapie restent à consulter.', true, 'Le RCP le rappelle.'],
    ['Elle prouve que toute angine nécessite de l’amoxicilline.', false, 'L’exemple porte sur une angine documentée à streptocoque.'],
    ['Elle fournit à elle seule une ordonnance adaptée à chaque patient.', false, 'L’indication ne constitue pas une décision individuelle.'],
  ], 'Distinguer indication réglementaire et stratégie thérapeutique.'),
  exercise('levetiracetam-monotherapie-age', 'levetiracetam', 'clinicalContexts', 'RCP du lévétiracétam : monothérapie des crises partielles dans une épilepsie nouvellement diagnostiquée. Quelle population est documentée ?', [
    ['À partir de 16 ans.', true, 'Limite de cette indication.'],
    ['Toutes les indications en association ont la même limite.', false, 'Leurs populations sont distinctes.'],
    ['Le type de crise fait partie de l’indication.', true, 'Conserver âge, contexte et type de crise.'],
  ], 'Ne pas transférer les critères d’une indication à une autre.'),
  exercise('spironolactone-rein-population', 'spironolactone', 'renalContext', 'Spironolactone : comment lire les restrictions rénales documentées ?', [
    ['L’insuffisance rénale modérée est aussi une contre-indication chez l’enfant.', true, 'Restriction pédiatrique spécifique.'],
    ['La créatininémie isolée garantit une fonction rénale normale.', false, 'Elle peut être faussement rassurante.'],
    ['Les restrictions sont indépendantes de la population.', false, 'Le RCP distingue l’enfant.'],
  ], 'Conserver la population et évaluer la fonction rénale dans son contexte.'),
  exercise('spironolactone-effet-demi-vie', 'spironolactone', 'therapeuticEffects', 'La durée de l’effet diurétique (24–48 h) donne-t-elle la demi-vie plasmatique de la spironolactone ?', [
    ['Non : effet et demi-vie sont des grandeurs distinctes.', true, 'La demi-vie doit avoir sa propre référence ; la durée d’effet ne la remplace pas.'],
    ['Oui : cette durée remplit automatiquement le champ demi-vie.', false, 'Ce serait une extrapolation sans preuve.'],
  ], 'Ne pas transformer une durée d’effet en donnée pharmacocinétique.', 'kinetics'),
];
