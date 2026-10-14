import {readFile,writeFile} from 'node:fs/promises';
import {parseDrugs} from '../src/domain/validation';
import type {Drug,FieldKey,ScientificField} from '../src/domain/models';
// Sélection éditoriale datée, relue sur les RCP originaux le 14 octobre 2026.
const path='src/data/drugs.json';const drugs=JSON.parse(await readFile(path,'utf8')) as Drug[];parseDrugs(drugs);
const references:Record<string,[string,string]>={amoxicilline:['60453197','2026-09-18'],levetiracetam:['61610687','2025-12-11'],sertraline:['63288007','2023-06-19'],clopidogrel:['67233727','2025-05-07']};
function add(id:string,key:FieldKey,value:string,section:string,scope:ScientificField['scope']='context'){
 const d=drugs.find(d=>d.id===id)!;if(d.fields[key].status!=='missing')throw Error(`Champ déjà documenté : ${id}/${key}`);const [cis,date]=references[id];
 d.fields[key]={status:'available',value,verification:'source-checked',scope,context:`Synthèse non exhaustive du RCP ${d.fields.brands.value}. Conserver formulation, indication et circonstances décrites ; aucune fréquence universelle de contrôle ni prescription individuelle.`,evidence:[{sourceId:'bdpm',url:`https://base-donnees-publique.medicaments.gouv.fr/medicament/${cis}/extrait`,consultedAt:'2026-10-14',sourceUpdatedAt:date,locator:`RCP ${d.fields.brands.value}, rubrique ${section} ; relecture du 14 octobre 2026`}]};d.contentVersion='2026.10.14-5';
}
add('amoxicilline','physiologicalEffects','Fragilisation de la paroi bactérienne, souvent suivie de lyse et mort cellulaire.','5.1','molecule');
add('amoxicilline','precautions','Rechercher les antécédents d’hypersensibilité aux bêta-lactamines. Éviter en cas de suspicion de mononucléose infectieuse ; risque d’éruption.','4.4');
add('amoxicilline','clinicalMonitoring','Rechercher les réactions allergiques et les diarrhées pendant/après antibiothérapie ; surveillance des signes de lymphohistiocytose hémophagocytaire selon le RCP.','4.4');
add('amoxicilline','biologicalMonitoring','Traitement prolongé : contrôles réguliers des fonctions rénale, hépatique et hématopoïétique. Anticoagulant associé : surveillance appropriée de la coagulation.','4.4');
add('levetiracetam','physiologicalEffects','Protection dans des modèles animaux de crises partielles/généralisées. Chez l’humain, activité documentée sur les décharges épileptiformes et la réponse photoparoxystique.','5.1');
add('levetiracetam','therapeuticEffects','Réduction de fréquence des crises partielles dans les études en association décrites au RCP. Ne pas extrapoler à toute épilepsie.','5.1');
add('levetiracetam','precautions','Surveiller dépression, idées suicidaires et changements d’humeur/comportement. Prudence si allongement QT, cardiopathie ou troubles électrolytiques.','4.4');
add('sertraline','precautions','Risque d’hyponatrémie accru chez le sujet âgé, sous diurétique ou en déplétion volémique. Éviter l’arrêt brutal ; diminution progressive décrite au RCP.','4.4');
add('sertraline','biologicalMonitoring','Contexte diabétique : surveiller le contrôle glycémique. Risque d’hyponatrémie à considérer chez les personnes exposées ; aucun calendrier systématique de natrémie fixé ici.','4.4');
add('sertraline','clinicalContexts','Exemple documentaire : TOC chez l’adulte et chez l’enfant/adolescent de 6 à 17 ans. Cette autorisation pédiatrique ne couvre pas toutes les indications adultes.','4.1 et 5.1');
add('clopidogrel','physiologicalEffects','Le métabolite actif inhibe irréversiblement la réponse plaquettaire à l’ADP ; récupération liée au renouvellement des plaquettes.','5.1','molecule');
add('clopidogrel','therapeuticEffects','Prévention d’événements athérothrombotiques dans les contextes autorisés ; ne pas déduire une supériorité universelle sur les autres antiagrégants.','4.1 et 5.1');
add('clopidogrel','biologicalMonitoring','En cas de signes de saignement : envisager rapidement NFS et/ou examens appropriés. Ce n’est pas un calendrier systématique pour tous les patients.','4.4');
add('clopidogrel','clinicalContexts','Exemple de prévention secondaire : adulte avec artériopathie oblitérante des membres inférieurs établie. Autres situations et associations : consulter la rubrique complète.','4.1');
add('clopidogrel','renalAdjustment','Expérience limitée en insuffisance rénale ; utilisation prudente. Le RCP ne fournit pas ici un algorithme numérique universel d’adaptation.','4.2 et 4.4');
add('clopidogrel','hepaticAdjustment','Expérience limitée en insuffisance hépatique modérée avec diathèse hémorragique : prudence. Insuffisance hépatique sévère : contre-indication.','4.2, 4.3 et 4.4');
parseDrugs(drugs);await writeFile(path,JSON.stringify(drugs,null,2)+'\n');console.log('16 rubriques auparavant absentes documentées, sans validation indépendante.');
