import {readFile, writeFile} from 'node:fs/promises';
import {parseDrugs} from '../src/domain/validation';
import type {Drug, FieldKey, ScientificField} from '../src/domain/models';
// Historique éditorial du 14 octobre 2026 : ne pas réexécuter comme actualiseur automatique.
const path = 'src/data/drugs.json';
const drugs = JSON.parse(await readFile(path, 'utf8')) as Drug[];
parseDrugs(drugs);
const references: Record<string, [string, string]> = {
  spironolactone: ['60625921', '2026-07-08'], bisoprolol: ['60524826', '2025-10-20'],
  levetiracetam: ['61610687', '2025-12-11'], ibuprofene: ['69932537', '2025-07-17'],
  amoxicilline: ['60453197', '2026-09-18'], prednisolone: ['69200035', '2024-03-19'],
};
function add(id: string, key: FieldKey, value: string, section: string, scope: ScientificField['scope'] = 'context') {
  const drug = drugs.find(d => d.id === id)!;
  if (drug.fields[key].status !== 'missing') throw Error(`Champ déjà documenté : ${id}/${key}`);
  const [cis, date] = references[id];
  drug.fields[key] = {status: 'available', value, verification: 'source-checked', scope,
    context: `Synthèse partielle du RCP ${drug.fields.brands.value}. Formulation, indication et population de cette référence uniquement ; aucun choix individuel de traitement.`,
    evidence: [{sourceId: 'bdpm', url: `https://base-donnees-publique.medicaments.gouv.fr/medicament/${cis}/extrait`,
      consultedAt: '2026-10-14', sourceUpdatedAt: date, locator: `RCP ${drug.fields.brands.value}, rubrique(s) ${section}`} ]};
  drug.contentVersion = '2026.10.14-8';
}
add('spironolactone', 'physiologicalEffects', 'Élimination accrue de sodium et d’eau, avec épargne potassique.', '5.1 ; notice, indications', 'molecule');
add('spironolactone', 'therapeuticEffects', 'Effet antiminéralocorticoïde maximal vers 24 h ; effet diurétique prolongé de 24 à 48 h. Ces durées ne sont pas une demi-vie plasmatique.', '5.1–5.2');
add('spironolactone', 'distribution', 'Passage placentaire et présence possible dans le lait de la molécule ou de ses métabolites. Aucun volume de distribution fourni.', '5.2');
add('spironolactone', 'clinicalContexts', 'Exemple : adulte avec insuffisance cardiaque NYHA III/IV, FEVG ≤ 35 %, dans l’association décrite au RCP.', '4.1', 'specialty');
add('spironolactone', 'precautions', 'Hyperkaliémie : risque majoré par âge, diabète, atteinte rénale, associations hyperkaliémiantes ou événement intercurrent.', '4.4');
add('spironolactone', 'clinicalMonitoring', 'Surveillance périodique de l’état volumétrique : diurèse excessive, déshydratation et hypotension à considérer.', '4.4');
add('spironolactone', 'renalContext', 'Contre-indication rénale sévère/aiguë ; chez l’enfant, également modérée. La créatininémie isolée peut être faussement rassurante.', '4.3–4.4');
add('spironolactone', 'hepaticContext', 'Stade terminal hépatique : contre-indication. Cirrhose avec natrémie < 125 mmol/L : usage généralement déconseillé.', '4.3');
add('spironolactone', 'essentials', '1. Antagoniste de l’aldostérone.\n2. Épargne potassique.\n3. Hyperkaliémie possible.\n4. Surveiller kaliémie et fonction rénale.\n5. Respecter indication et restrictions de population.', '4.1, 4.3–4.4, 5.1');
add('bisoprolol', 'clinicalContexts', 'BISOPROLOL TEVA 10 mg : HTA et angor chronique stable. Ce dosage ne doit pas être utilisé pour traiter l’insuffisance cardiaque chronique ; le RCP renvoie à d’autres formulations et à une titration stricte.', '4.1, 4.4', 'specialty');
add('levetiracetam', 'clinicalContexts', 'Monothérapie : crises partielles avec ou sans généralisation secondaire, épilepsie nouvellement diagnostiquée, à partir de 16 ans. Les indications en association ont d’autres limites d’âge et de type de crise.', '4.1', 'specialty');
add('ibuprofene', 'cyp', 'Substrat du CYP2C9 ; ses inhibiteurs peuvent augmenter l’exposition à l’ibuprofène.', '4.5', 'molecule');
add('ibuprofene', 'clinicalContexts', 'Douleurs légères/modérées ou fièvre, traitement court ; cette spécialité 200 mg concerne les adultes et adolescents d’au moins 12 ans et 40 kg.', '4.1', 'specialty');
add('ibuprofene', 'clinicalMonitoring', 'Dans un contexte infectieux, surveiller l’évolution : douleur et fièvre peuvent être masquées. Persistance ou aggravation des symptômes : consultation médicale.', '4.4');
add('ibuprofene', 'biologicalMonitoring', 'Fonction rénale/hépatique selon l’atteinte correspondante ; kaliémie avec IEC ou diurétique épargneur de potassium. Pas de calendrier universel déduit.', '4.2, 4.5');
add('ibuprofene', 'therapeuticStrategy', 'Cadre du RCP : traitement symptomatique court, dose efficace minimale et durée minimale. Ce résumé ne définit pas la place dans toutes les recommandations françaises.', '4.1–4.2', 'specialty');
add('amoxicilline', 'therapeuticEffects', 'L’inhibition de la synthèse de paroi peut entraîner lyse et mort bactériennes ; les bêta-lactamases limitent le spectre.', '5.1', 'molecule');
add('amoxicilline', 'clinicalContexts', 'Exemples d’indications : angine documentée à streptocoque, sinusite bactérienne aiguë, pneumonie communautaire. Une indication au RCP ne dispense pas des recommandations officielles d’antibiothérapie.', '4.1', 'specialty');
add('prednisolone', 'clinicalContexts', 'Exemples d’indications de la spécialité : poussées de lupus systémique ou de maladie de Crohn ; ne pas généraliser à toute situation inflammatoire.', '4.1', 'specialty');
const sertraline = drugs.find(d => d.id === 'sertraline')!;
sertraline.referenceNotice = {status: 'available', scope: 'specialty', verification: 'source-checked',
  value: 'Référence historique : autorisation de SERTRALINE VIATRIS GENERIQUES 25 mg, gélule abrogée le 30 septembre 2024.',
  context: 'Le RCP conservé sert à une lecture documentaire. Cela ne signifie pas que toutes les spécialités de sertraline sont retirées ; vérifier une spécialité actuelle dans le catalogue.',
  evidence: [{sourceId: 'bdpm', url: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/63288007/extrait', consultedAt: '2026-10-14', sourceUpdatedAt: null,
    locator: 'Fiche info : statut de l’autorisation « Abrogée le 30-09-2024 » ; distinct de la date du RCP (19/06/2023).'}]};
for (const field of Object.values(sertraline.fields)) if (field.status === 'available' && field.evidence.some(e => e.sourceId === 'bdpm')) {
  field.context += ' Référence de spécialité historique : autorisation abrogée le 30/09/2024 ; ne pas en déduire un statut pour toute la DCI.';
}
sertraline.contentVersion = '2026.10.14-8';
parseDrugs(drugs);
await writeFile(path, JSON.stringify(drugs, null, 2) + '\n');
console.log('19 rubriques documentées ; réserve historique de la sertraline conservée avec provenance.');
