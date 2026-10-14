import {readFile,writeFile} from 'node:fs/promises';
import {parseDrugs} from '../src/domain/validation';
const path='src/data/drugs.json';const drugs=parseDrugs(JSON.parse(await readFile(path,'utf8')));
const met=drugs.find(d=>d.id==='metformine')!;
for(const [key,value,section] of [
 ['precautions','Contraste iodé intravasculaire : interruption avant ou lors de l’examen ; reprise après au moins 48 h et réévaluation rénale stable. Déshydratation : interruption temporaire et contact avec un professionnel.','4.4'],
 ['interactions','Contraste iodé : atteinte rénale pouvant entraîner accumulation et acidose lactique. Alcool et médicaments altérant la fonction rénale : risques documentés.','4.5'],
 ['contraindications','Sélection : DFG < 30 mL/min, acidose métabolique aiguë ; affections aiguës altérant la fonction rénale, dont déshydratation, infection grave et choc.','4.3']
 ] as const){met.fields[key]={...met.fields[key],status:'available',value,verification:'source-checked',scope:'context',evidence:[{sourceId:'bdpm',url:'https://base-donnees-publique.medicaments.gouv.fr/medicament/69916198/extrait',consultedAt:'2026-10-14',sourceUpdatedAt:'2025-03-26',locator:'RCP METFORMINE BGR 500 mg, rubrique '+section}]};}
met.contentVersion='2026.10.14-4';
for(const id of ['apixaban','spironolactone']){const d=drugs.find(d=>d.id===id)!;const f=d.fields.biologicalMonitoring;d.fields.examTraps={...f,status:'available',value:id==='apixaban'?'Ne pas assimiler INR et mesure d’activité de cet AOD.':'Un diurétique épargneur de potassium ne protège pas de l’hyperkaliémie.',verification:'source-checked',scope:'context',context:'Aide pédagogique originale ; aucune validation indépendante d’examen.',evidence:[...f.evidence,...d.fields.commonEffects.evidence]};}
parseDrugs(drugs);await writeFile(path,JSON.stringify(drugs,null,2)+'\n');
