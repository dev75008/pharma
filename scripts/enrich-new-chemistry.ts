import {readFile,writeFile} from 'node:fs/promises';
import {molecularJson,parsePubchem,fetchChembl} from '../src/data/adapters/molecular';
import {parseDrugs} from '../src/domain/validation';
import type {FieldKey} from '../src/domain/models';
const path='src/data/drugs.json';const original=await readFile(path,'utf8');const drugs=parseDrugs(JSON.parse(original));
const snapshots=[];
for(const id of ['apixaban','spironolactone']){
 const url=`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${id}/property/MolecularFormula,MolecularWeight,InChIKey,SMILES,XLogP,TPSA/JSON`;
 const raw=await molecularJson('pubchem',url) as {PropertyTable:{Properties:{CID:number}[]}};
 if(raw.PropertyTable?.Properties?.length!==1)throw Error('Identité ambiguë.');
 const p=parsePubchem(raw,raw.PropertyTable.Properties[0].CID);const match=await fetchChembl(p.InChIKey);
 const d=drugs.find(d=>d.id===id)!;const evidence=[{sourceId:'pubchem',url,consultedAt:new Date().toISOString().slice(0,10),sourceUpdatedAt:null,locator:`PubChem CID ${p.CID}, propriétés structurales calculées ; ne démontre ni équivalence clinique ni identité de formulation.`}];
 const values:Partial<Record<FieldKey,string>>={formula:p.MolecularFormula,molecularMass:p.MolecularWeight+' g/mol',smiles:p.SMILES,pubchem:`https://pubchem.ncbi.nlm.nih.gov/compound/${p.CID}`,physicochemical:`Propriétés calculées : XLogP ${p.XLogP??'indisponible'} ; TPSA ${p.TPSA??'indisponible'} Å². Sans interprétation d’efficacité clinique.`};
 for(const [key,value] of Object.entries(values))d.fields[key as FieldKey]={status:'available',value,scope:'molecule',context:'Structure PubChem ; sel, hydrate et formulation clinique distincts.',verification:'source-checked',evidence};
 if(match.sourceId==='chembl'&&match.molecule)d.fields.chembl={status:'available',value:`https://www.ebi.ac.uk/chembl/explore/compound/${match.molecule.molecule_chembl_id}`,verification:'source-checked',scope:'molecule',context:`Correspondance InChIKey complet ${p.InChIKey}. Ne démontre ni équivalence clinique ni identité de sel ou formulation.`,evidence:[...evidence,{sourceId:'chembl',url:match.url,consultedAt:match.retrievedAt.slice(0,10),sourceUpdatedAt:null,locator:'Correspondance structurale unique ; ChEMBL CC BY-SA 3.0'}]};
 snapshots.push({drugId:id,properties:p,match});console.log(id,p.CID,match.sourceId==='chembl'?match.molecule?.molecule_chembl_id:null);
}
parseDrugs(drugs);if(await readFile(path,'utf8')!==original)throw Error('Modification concurrente.');
await writeFile('public/data/additional-chemistry.json',JSON.stringify({schemaVersion:1,license:'PubChem ; ChEMBL CC BY-SA 3.0',snapshots},null,2)+'\n');
await writeFile(path,JSON.stringify(drugs,null,2)+'\n');
