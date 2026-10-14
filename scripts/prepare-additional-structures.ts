import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {parseDrugs} from '../src/domain/validation';
import type {Drug} from '../src/domain/models';
const file='src/data/drugs.json';const original=await readFile(file,'utf8');const drugs=JSON.parse(original) as Drug[];parseDrugs(drugs);
const images=[];
for(const id of ['apixaban','spironolactone']){
 const d=drugs.find(d=>d.id===id)!;if(d.fields.structure2d.status!=='missing')throw Error('Structure déjà conservée.');
 const cid=/^https:\/\/pubchem\.ncbi\.nlm\.nih\.gov\/compound\/(\d+)$/.exec(d.fields.pubchem.value??'')?.[1];if(!cid)throw Error('CID non documenté.');
 if(images.length)await new Promise(r=>setTimeout(r,1000));
 const url=`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?record_type=2d`;
 const response=await fetch(url,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('PubChem HTTP '+response.status);
 const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length>2000000||bytes.length<24||![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))throw Error('PNG invalide.');
 images.push({id,bytes});d.fields.structure2d={status:'available',value:`structures/${id}.png`,verification:'source-checked',scope:'molecule',context:`Représentation 2D calculée PubChem CID ${cid} ; ne garantit ni identité de sel/hydrate ni équivalence de formulation clinique.`,evidence:[{sourceId:'pubchem',url,consultedAt:new Date().toISOString().slice(0,10),sourceUpdatedAt:null,locator:`PubChem CID ${cid} : PNG calculé, record_type=2d`} ]};d.contentVersion='2026.10.14-6';
}
parseDrugs(drugs);if(await readFile(file,'utf8')!==original)throw Error('Catalogue modifié pendant la collecte.');
await mkdir('public/structures',{recursive:true});for(const image of images)await writeFile(`public/structures/${image.id}.png`,image.bytes);await writeFile(file,JSON.stringify(drugs,null,2)+'\n');console.log('Deux structures 2D calculées conservées pour la PWA.');
