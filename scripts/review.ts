import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {catalogReviewPacket} from '../src/data/reviewCatalog';
import {checkReviewReport,verifyReviewPacket} from '../src/domain/contentReview';
const [command,file,originalFile]=process.argv.slice(2);const packet=await catalogReviewPacket();
if(command==='export'){
 const path=resolve(file??'review/packet.json');await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(packet,null,2)+'\n');
 console.log(`Dossier exporté : ${path} (${packet.items.length} éléments). Sources/versions incluses, aucune validation obtenue.`);
}else if(command==='check'&&file&&originalFile){
 for(const path of [file,originalFile]){const stat=await import('node:fs/promises').then(fs=>fs.stat(path));if(stat.size>10*1024*1024)throw Error('Rapport ou dossier trop volumineux.');}
 const original=await verifyReviewPacket(JSON.parse(await readFile(originalFile,'utf8')));if(original.packetHash!==packet.packetHash)throw Error('Le catalogue courant diffère du dossier relu. Exporter un nouveau dossier.');
 const result=checkReviewReport(JSON.parse(await readFile(file,'utf8')),original);
 console.log(JSON.stringify({accepted:result.accepted,changesRequested:result.changesRequested,rejected:result.rejected,unreviewed:result.unreviewed}));
 console.log('Déclaration compatible avec les contenus courants. Identité, qualification et indépendance non authentifiées ; aucun statut scientifique modifié.');
}else throw Error('Usage : npm run review:export -- [fichier] ou npm run review:check -- rapport.json dossier-original.json');
