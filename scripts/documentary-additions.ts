import {readFile,writeFile} from 'node:fs/promises';
import {parseDrugs} from '../src/domain/validation';
import type {Drug,FieldKey,ScientificField} from '../src/domain/models';
// Révision éditoriale datée, explicite et reproductible. Aucune inférence d'API clinique.
const file='src/data/drugs.json';
const drugs=JSON.parse(await readFile(file,'utf8')) as Drug[];parseDrugs(drugs);
function add(id:string,key:FieldKey,value:string,section:string,scope:ScientificField['scope']='specialty'){
 const d=drugs.find(d=>d.id===id)!;const reference=d.fields.brands.evidence[0];
 d.fields[key]={status:'available',value,scope,verification:'source-checked',context:`Synthèse non exhaustive du RCP de ${d.fields.brands.value}. Le contexte clinique et la formulation doivent être conservés.`,evidence:[{...reference,consultedAt:'2026-10-14',locator:`RCP ${d.fields.brands.value}, rubrique ${section} ; relecture documentaire du 14 octobre 2026`}]};
 d.contentVersion='2026.10.14-2';
}
add('bisoprolol','renalContext','Dans ce RCP, une clairance de créatinine inférieure à 20 mL/min impose un plafond de 10 mg/j. Consulter les modalités de titration et de surveillance.','4.2','context');
add('bisoprolol','hepaticContext','Une insuffisance hépatique sévère limite la dose à 10 mg/j dans cette spécialité.','4.2','context');
add('ramipril','physiologicalEffects','Vasodilatation et diminution de la sécrétion d’aldostérone, consécutives à la baisse de formation d’angiotensine II et à la moindre dégradation de bradykinine.','5.1','molecule');
add('ramipril','therapeuticEffects','Réduction de la pression artérielle chez le patient hypertendu, sans augmentation compensatrice de la fréquence cardiaque.','5.1');
add('losartan','physiologicalEffects','Blocage des effets de l’angiotensine II sur AT1, notamment vasoconstriction et libération d’aldostérone.','5.1','molecule');
add('losartan','therapeuticEffects','Activité antihypertensive ; réduction documentée de la protéinurie chez les patients hypertendus non diabétiques ayant une protéinurie. Ce résultat ne constitue pas une indication universelle.','5.1');
add('paracetamol','indications','Pour cette solution IV : douleur modérée ou fièvre, en traitement court, lorsque l’urgence justifie la voie IV ou lorsque les autres voies ne sont pas possibles.','4.1');
add('paracetamol','clinicalContexts','Exemple documentaire : douleur modérée postopératoire lorsque la voie IV est cliniquement justifiée. Ne pas extrapoler ces conditions à toutes les formes orales.','4.1','context');
add('paracetamol','physiologicalEffects','Pour cette perfusion : début du soulagement en 5–10 min ; effet antalgique maximal vers 1 h, généralement pendant 4–6 h. Baisse de fièvre vers 30 min, effet au moins 6 h.','5.1');
add('paracetamol','biologicalMonitoring','Dans le contexte du surdosage : dosage plasmatique du paracétamol et tests hépatiques répétés toutes les 24 h selon le RCP. Ce n’est pas un programme systématique de surveillance du traitement usuel.','4.9','context');
add('prednisolone','clinicalMonitoring','Surveiller l’apparition d’infections, dont les signes peuvent être masqués. Après traitement prolongé, l’arrêt progressif tient compte du risque de rechute et d’insuffisance surrénalienne.','4.2 et 4.4','context');
add('prednisolone','biologicalMonitoring','En sclérose systémique exposée au risque de crise rénale sous prednisolone : contrôles réguliers de pression artérielle et de créatinine. Avec un autre hypokaliémiant : surveillance de la kaliémie.','4.4 et 4.5','context');
add('metformine','clinicalMonitoring','Informer sur les signes d’acidose lactique, notamment dyspnée, douleurs abdominales, crampes et asthénie. Contrôle cardiaque et rénal régulier si insuffisance cardiaque chronique stable.','4.4','context');
add('rivaroxaban','precautions','Prudence avec les médicaments modifiant l’hémostase, notamment AINS, antiagrégants et ISRS/IRSN. Les risques rénaux, hémorragiques et les associations avec inhibiteurs puissants CYP3A4/P-gp doivent être relus dans le RCP.','4.4 et 4.5','context');
add('rivaroxaban','interactions','Inhibiteurs puissants CYP3A4/P-gp : exposition et risque hémorragique accrus. AINS et antiagrégants : prudence en raison du risque de saignement. Avec ISRS/IRSN, risque hémorragique potentiellement augmenté.','4.4 et 4.5','context');

const pred=drugs.find(d=>d.id==='prednisolone')!;
for(const [key,value] of [
 ['target','Récepteur intracellulaire des glucocorticoïdes (GR), appartenant à la famille des récepteurs nucléaires.'],
 ['mechanism','L’activation de GR entraîne sa translocation vers le noyau et modifie la transcription de gènes, notamment par interaction avec les éléments GRE et les facteurs de transcription inflammatoires. Des effets non génomiques sont également décrits pour la classe.'],
 ['actionType','Agonisme du récepteur des glucocorticoïdes ; mécanisme de classe distinct de l’inhibition directe des cyclo-oxygénases par les AINS.'],
] as [FieldKey,string][]){pred.fields[key]={status:'available',value,verification:'source-checked',scope:'molecule',context:'Synthèse originale du mécanisme de classe des glucocorticoïdes, dont la prednisolone, à partir du Collège national de pharmacologie médicale. Ne provient pas du RCP ; pas de validation indépendante.',evidence:[{sourceId:'cnpm',url:'https://pharmacomedicale.org/medicaments/par-specialites/item/corticoides-les-points-essentiels',consultedAt:'2026-10-14',sourceUpdatedAt:'2025-06-05',locator:'CNPM, Corticoïdes : points essentiels, résumé et mécanismes ; prednisolone dans le tableau des glucocorticoïdes. Paraphrase originale, aucun cours ou tableau reproduit.'}]};}

// Pièges pédagogiques originaux : pas de prétention à un référentiel officiel d'examen.
const traps:Record<string,{text:string;keys:FieldKey[]}>={
 bisoprolol:{text:'La sélectivité bêta-1 est préférentielle. Les indications d’une spécialité de référence ne décrivent pas toutes les spécialités de bisoprolol.',keys:['mechanism','indications']},
 ramipril:{text:'Le ramipril est une promolécule : distinguer sa dose et la demi-vie de son métabolite actif, le ramiprilate. Grossesse : ne pas confondre la restriction du premier trimestre avec la contre-indication aux deuxième et troisième.',keys:['activeMetabolites','halfLife','pregnancy']},
 losartan:{text:'Distinguer le losartan de son métabolite actif pour les demi-vies. Un antagoniste AT1 n’est pas un inhibiteur de l’enzyme de conversion.',keys:['mechanism','halfLife']},
 furosemide:{text:'La demi-vie de 1–1,5 h est documentée après administration IV. Ne pas utiliser cette fiche injectable pour affirmer la biodisponibilité d’une forme orale.',keys:['halfLife','routes','forms']},
 rivaroxaban:{text:'L’INR n’est pas adapté au suivi de son activité anticoagulante. L’adaptation rénale dépend de l’indication : aucun schéma unique ne couvre tous les usages.',keys:['biologicalMonitoring','renalAdjustment']},
 clopidogrel:{text:'La molécule administrée nécessite une activation métabolique. Ne pas assimiler sa demi-vie plasmatique à la durée de l’inhibition irréversible des plaquettes.',keys:['mechanism','metabolism','halfLife']},
 amoxicilline:{text:'Une bêta-lactamase peut inactiver l’amoxicilline. Les indications restent dépendantes du germe et du contexte ; une propriété de classe ne garantit pas une activité contre toute bactérie.',keys:['mechanism','indications']},
 metformine:{text:'La metformine ne stimule pas directement la sécrétion d’insuline. La contre-indication rénale documentée est un DFG < 30 mL/min ; le risque d’acidose lactique dépend également du contexte.',keys:['mechanism','contraindications','precautions']},
 paracetamol:{text:'Cette fiche s’appuie sur une solution pour perfusion : douleur au site d’injection et conditions d’utilisation IV ne s’appliquent pas aux formes orales. La cible moléculaire précise ne doit pas être inventée.',keys:['forms','routes','commonEffects','mechanism']},
 ibuprofene:{text:'La contre-indication au troisième trimestre ne résume pas toutes les restrictions de grossesse. Les risques fœtaux décrits dès vingt semaines doivent aussi être considérés dans la lecture du RCP.',keys:['pregnancy']},
 prednisolone:{text:'La demi-vie plasmatique n’est pas la durée de l’effet biologique. Les restrictions de vaccins vivants dépendent du contexte de corticothérapie.',keys:['halfLife','interactions']},
 sertraline:{text:'Distinguer la demi-vie de la sertraline et celle de la N-desméthylsertraline. Les interactions sérotoninergiques restent à vérifier même si la recapture est sélective.',keys:['halfLife','interactions']},
 levetiracetam:{text:'Une liaison à SV2A ne signifie pas que le mécanisme exact soit totalement élucidé. La baisse de fonction rénale prolonge la demi-vie et modifie les adaptations documentées.',keys:['mechanism','halfLife','renalAdjustment']},
};
for(const d of drugs){const entry=traps[d.id];if(!entry)continue;const fields=entry.keys.map(k=>d.fields[k]);if(fields.some(f=>f.status!=='available'))throw new Error(`Champ source absent pour ${d.id}`);
 const evidence=fields.flatMap(f=>f.evidence).filter((e,i,a)=>a.findIndex(x=>JSON.stringify(x)===JSON.stringify(e))===i);
 d.fields.examTraps={status:'available',value:entry.text,verification:'source-checked',scope:'context',context:'Aide pédagogique originale fondée sur les champs référencés. Ni liste officielle de pièges d’examen, ni validation médicale indépendante.',evidence};
 d.contentVersion='2026.10.14-2';
}
parseDrugs(drugs);
await writeFile(file,JSON.stringify(drugs,null,2)+'\n');
console.log(`Champs documentés : ${drugs.flatMap(d=>Object.values(d.fields)).filter(f=>f.status==='available').length}/650`);
