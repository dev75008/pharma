import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fetchConformer,parseConformer} from '../src/data/adapters/conformer';
import {parseDrugs} from '../src/domain/validation';
import type {Drug} from '../src/domain/models';
const path='src/data/drugs.json';const original=await readFile(path,'utf8');const drugs=JSON.parse(original) as Drug[];parseDrugs(drugs);
const items=[];const contents=[];
for(const drug of drugs){
 const cid=Number(/^https:\/\/pubchem\.ncbi\.nlm\.nih\.gov\/compound\/(\d+)$/.exec(drug.fields.pubchem.value??'')?.[1]);if(!cid)continue;
 const result=await fetchConformer(cid);const sdf=result.sdf.replace(/\r\n?/g,'\n');const model=parseConformer(sdf,cid);const assetPath=`conformers/${drug.id}.txt`;
 items.push({drugId:drug.id,cid,url:result.url,retrievedAt:result.retrievedAt,assetPath,sha256:createHash('sha256').update(sdf).digest('hex'),atoms:model.atoms,bonds:model.bonds});contents.push({assetPath,sdf});
 drug.fields.structure3d={status:'available',value:result.url,verification:'source-checked',scope:'molecule',context:`Conformère PubChem calculé CID ${cid}, inclus dans cette version pour lecture hors ligne. Ni structure expérimentale ni conformation liée à une cible ; sel/formulation clinique potentiellement distincts.`,evidence:[{sourceId:'pubchem',url:result.url,consultedAt:result.retrievedAt.slice(0,10),sourceUpdatedAt:null,locator:`SDF record_type=3d : identité CID, coordonnées V2000 et liaisons vérifiées ; ${model.atoms} atomes, ${model.bonds} liaisons`} ]};drug.contentVersion='2026.10.14-7';console.log(drug.id,model.atoms,model.bonds);
}
parseDrugs(drugs);if(await readFile(path,'utf8')!==original)throw Error('Catalogue modifié pendant la collecte.');await mkdir('public/conformers',{recursive:true});for(const content of contents)await writeFile('public/'+content.assetPath,content.sdf);
await writeFile('src/data/bundled-conformers.json',JSON.stringify({schemaVersion:1,license:'Structures calculées PubChem ; attribution aux sources originales',items},null,2)+'\n');await writeFile(path,JSON.stringify(drugs,null,2)+'\n');console.log('Conformères inclus : '+items.length);
