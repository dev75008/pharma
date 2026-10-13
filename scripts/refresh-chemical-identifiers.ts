import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fetchChembl,fetchPubchem} from '../src/data/adapters/molecular';
import {parseDrugs} from '../src/domain/validation';
import type {Drug} from '../src/domain/models';
// Enrichissement structural uniquement ; aucune donnée clinique n'est importée.
// Écrit après validation complète. Une erreur conserve le catalogue existant.
const file='src/data/drugs.json';
const original=await readFile(file,'utf8');
const drugs=JSON.parse(original) as Drug[];parseDrugs(drugs);
const snapshots=[];
for(const drug of drugs){
 const field=drug.fields.pubchem;
 if(field.status!=='available')continue;
 const cid=Number(/^https:\/\/pubchem\.ncbi\.nlm\.nih\.gov\/compound\/(\d+)$/.exec(field.value)?.[1]);
 if(!Number.isSafeInteger(cid)||cid<=0)throw new Error(`CID non exploitable : ${drug.id}`);
 const properties=await fetchPubchem(cid);
 if(properties.sourceId!=='pubchem')throw new Error('Fournisseur incorrect.');
 const match=await fetchChembl(properties.properties.InChIKey);
 if(match.sourceId!=='chembl')throw new Error('Fournisseur incorrect.');
 snapshots.push({drugId:drug.id,pubchem:properties,chembl:match});
 if(match.molecule){
  drug.fields.chembl={status:'available',value:`https://www.ebi.ac.uk/chembl/explore/compound/${match.molecule.molecule_chembl_id}`,verification:'source-checked',scope:'molecule',context:`Correspondance structurale exacte avec le CID ${cid} : InChIKey ${match.inchiKey}. Ne démontre ni équivalence clinique, ni identité de sel ou de formulation pharmaceutique.`,evidence:[{sourceId:'pubchem',url:properties.url,consultedAt:properties.retrievedAt.slice(0,10),sourceUpdatedAt:null,locator:`PUG REST : CID ${cid}, InChIKey complet`},{sourceId:'chembl',url:match.url,consultedAt:match.retrievedAt.slice(0,10),sourceUpdatedAt:null,locator:`API ChEMBL : correspondance unique ${match.molecule.molecule_chembl_id}, InChIKey complet ; données ChEMBL CC BY-SA 3.0`} ]};
  drug.contentVersion='2026.10.14-2';
 }
 console.log(`${drug.id} : ${match.molecule?.molecule_chembl_id??'absence documentée, champ conservé'}`);
}
parseDrugs(drugs);
// Refuse une écriture concurrente depuis le début de l'opération réseau.
if(await readFile(file,'utf8')!==original)throw new Error('Catalogue modifié pendant la collecte : écriture annulée.');
await mkdir('public/data',{recursive:true});
await writeFile('public/data/chemical-identifiers.json',JSON.stringify({schemaVersion:1,license:'ChEMBL CC BY-SA 3.0 ; propriétés structurales PubChem',snapshots},null,2)+'\n');
await writeFile(file,JSON.stringify(drugs,null,2)+'\n');
