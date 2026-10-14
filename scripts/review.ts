import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {catalogReviewPacket} from '../src/data/reviewCatalog';
import {checkReviewReport,verifyReviewPacket} from '../src/domain/contentReview';
import {compareReviewPackets} from '../src/domain/reviewDiff';
const [command,file,originalFile,outputFile]=process.argv.slice(2);
async function readPacket(path:string){const stat=await import('node:fs/promises').then(fs=>fs.stat(path));if(stat.size>10*1024*1024)throw Error('Rapport ou dossier trop volumineux.');return JSON.parse(await readFile(path,'utf8'));}
if(command==='diff'&&file&&originalFile){
 const comparison=await compareReviewPackets(await readPacket(file),await readPacket(originalFile));
 const output=JSON.stringify(comparison,null,2)+'\n';
 if(outputFile){const path=resolve(outputFile);const normalized=(p:string)=>process.platform==='win32'?resolve(p).toLowerCase():resolve(p);if([file,originalFile].some(input=>normalized(input)===normalized(path)))throw Error('Le bilan ne peut pas écraser un dossier comparé.');await mkdir(dirname(path),{recursive:true});await writeFile(path,output);console.log(`Bilan écrit : ${path}`);}else console.log(output);
 console.log(`${comparison.added.length} ajout(s), ${comparison.removed.length} retrait(s), ${comparison.modified.length} modification(s), ${comparison.unchanged} inchangé(s). Aucune validation médicale.`);
}else if(command==='export'||command==='check'){
const packet=await catalogReviewPacket();
if(command==='export'){
 const path=resolve(file??'review/packet.json');await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(packet,null,2)+'\n');
 console.log(`Dossier exporté : ${path} (${packet.items.length} éléments). Sources/versions incluses, aucune validation obtenue.`);
}else if(command==='check'&&file&&originalFile){
 const original=await verifyReviewPacket(await readPacket(originalFile));if(original.packetHash!==packet.packetHash)throw Error('Le catalogue courant diffère du dossier relu. Exporter un nouveau dossier.');
 const result=checkReviewReport(await readPacket(file),original);
 console.log(JSON.stringify({accepted:result.accepted,changesRequested:result.changesRequested,rejected:result.rejected,unreviewed:result.unreviewed}));
 console.log('Déclaration compatible avec les contenus courants. Identité, qualification et indépendance non authentifiées ; aucun statut scientifique modifié.');
}else throw Error('Usage : npm run review:check -- rapport.json dossier-original.json');
}else throw Error('Usage : npm run review:export -- [fichier], npm run review:check -- rapport.json dossier-original.json ou npm run review:diff -- ancien.json nouveau.json [bilan.json]');
