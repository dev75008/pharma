import {readFile,writeFile} from 'node:fs/promises';
import {parseDrugs} from '../src/domain/validation';
import type {Drug,FieldKey,ScientificField} from '../src/domain/models';
const path='src/data/drugs.json';const drugs=JSON.parse(await readFile(path,'utf8')) as Drug[];parseDrugs(drugs);
function add(id:string,key:FieldKey,value:string,cis:string,date:string,section:string,scope:ScientificField['scope']='context'){
 const d=drugs.find(d=>d.id===id)!;if(d.fields[key].status!=='missing')throw Error('Champ déjà disponible : '+id+'/'+key);
 d.fields[key]={status:'available',value,verification:'source-checked',scope,context:`Synthèse originale non exhaustive du RCP ${d.fields.brands.value} ; contexte et formulation conservés.`,evidence:[{sourceId:'bdpm',url:`https://base-donnees-publique.medicaments.gouv.fr/medicament/${cis}/extrait`,consultedAt:'2026-10-14',sourceUpdatedAt:date,locator:`RCP ${d.fields.brands.value}, rubrique ${section}`} ]};d.contentVersion='2026.10.14-6';
}
add('furosemide','physiologicalEffects','Augmentation de l’excrétion de sodium, potassium, calcium et magnésium consécutive au blocage de la réabsorption dans l’anse.','65449480','2024-11-22','5.1','molecule');
add('furosemide','therapeuticEffects','Diurèse rapide ; effet IV dans les 15 minutes. Dans l’insuffisance cardiaque, diminution aiguë de la précharge décrite.','65449480','2024-11-22','5.1');
add('furosemide','doseResponse','Chez des sujets sains étudiés entre 10 et 100 mg : diurèse/natriurèse dose-dépendantes. Relation tubulaire–natriurèse sigmoïde chez les patients ; au-delà d’une dose en bolus, le gain devient limité.','65449480','2024-11-22','5.1');
add('furosemide','renalAdjustment','Pour cette solution injectable, si créatinine sérique > 5 mg/dL : débit maximal de perfusion recommandé 2,5 mg/min. Ne pas extrapoler en dose orale ou en seuil de DFG.','65449480','2024-11-22','4.2');
add('ramipril','clinicalContexts','Exemple de contexte autorisé : adulte ayant une hypertension. Les indications de néphropathie et de prévention cardiovasculaire ont leurs propres critères au RCP.','61599041','2024-06-06','4.1');
add('sertraline','physiologicalEffects','Aux doses cliniques, blocage de la capture de sérotonine dans les plaquettes humaines. Les observations animales restent distinctes des effets cliniques.','63288007','2023-06-19','5.1');
add('sertraline','distribution','Le RCP décrit un grand volume de distribution dans le contexte du surdosage, sans chiffre fourni ici. Ne pas transformer cette description en estimation numérique.','63288007','2023-06-19','4.9');
for(const [a,b] of [['ramipril','losartan'],['furosemide','spironolactone'],['rivaroxaban','apixaban']]){
 const first=drugs.find(d=>d.id===a)!,second=drugs.find(d=>d.id===b)!;
 for(const [d,other] of [[first,second],[second,first]]){if(d.fields.comparisons.status!=='missing')throw Error('Comparaison déjà présente.');const one=d.fields.mechanism,two=other.fields.mechanism;if(one.status!=='available'||two.status!=='available')throw Error('Mécanisme absent.');d.fields.comparisons={status:'available',value:`${d.fields.dci.value} : ${one.value}\n${other.fields.dci.value} : ${two.value}\nComparer ces propriétés documentées ne démontre ni interchangeabilité ni supériorité clinique.`,verification:'source-checked',scope:'context',context:'Assemblage pédagogique de deux champs existants et de leurs preuves, sans nouvelle inférence médicale. Lire séparément les indications et restrictions de chaque spécialité.',evidence:[...one.evidence,...two.evidence]};d.contentVersion='2026.10.14-6';}
}
parseDrugs(drugs);await writeFile(path,JSON.stringify(drugs,null,2)+'\n');console.log('7 rubriques RCP et 6 comparaisons pédagogiques ajoutées.');
