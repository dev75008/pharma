import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {contentPackSchema,checkContentRelations} from '../src/domain/contentPack';
import baseDrugs from '../src/data/drugs.json';
import baseClasses from '../src/data/classes.json';
import {sources} from '../src/data/sources';
import {questions} from '../src/data/questions';
import {clinicalCases} from '../src/data/clinicalCases';
import {flashcards} from '../src/data/flashcards';
const [command,input]=process.argv.slice(2);
try{
 if(!['validate','import'].includes(command)||!input)throw new Error('Usage : npm run content:validate -- fichier.json ou npm run content:import -- fichier.json');
 const file=await readFile(resolve(input),'utf8');if(Buffer.byteLength(file)>10000000)throw new Error('Fichier supérieur à 10 Mo.');
 const pack=contentPackSchema.parse(JSON.parse(file));
 // Les données courantes peuvent déjà inclure le paquet précédent ; les identifiants de base restent protégés.
 const previous=contentPackSchema.parse(JSON.parse(await readFile('src/data/manual-content.json','utf8')));
 const coreSources=sources.filter(s=>!previous.sources.some(p=>p.id===s.id)).map(s=>s.id);
 checkContentRelations(pack,{sources:coreSources,classes:baseClasses.map(c=>c.id),drugs:baseDrugs.map(d=>d.id),specialties:['cardiologie','nephrologie','infectiologie','endocrinologie','medecine-generale','psychiatrie','neurologie'],systems:['cardiovasculaire','renal','hemostase','infectieux','metabolique','douleur','immunitaire','nerveux']});
 for(const [incoming,existing,previousRows] of [[pack.questions,questions,previous.questions],[pack.cases,clinicalCases,previous.cases],[pack.flashcards,flashcards,previous.flashcards]] as const)if(incoming.some(row=>existing.some(e=>e.id===row.id)&&!previousRows.some(p=>p.id===row.id)))throw new Error('Collision avec un identifiant pédagogique existant.');
 if(command==='import')await writeFile('src/data/manual-content.json',JSON.stringify(pack,null,2)+'\n');
 console.log(`${command==='import'?'Import préparé pour la prochaine compilation':'Paquet vérifié'} : ${pack.drugs.length} fiches, ${pack.questions.length} questions, ${pack.cases.length} dossiers, ${pack.flashcards.length} cartes. Les droits déclarés et la validité médicale nécessitent une vérification humaine.`);
}catch(e){console.error(e instanceof Error?e.message:String(e));process.exitCode=1;}
