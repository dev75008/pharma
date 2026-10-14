import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {drugs,drugClasses} from '../src/data/drugs';
import {questions} from '../src/data/questions';
import {clinicalCases} from '../src/data/clinicalCases';
import {flashcards} from '../src/data/flashcards';
import {sources} from '../src/data/sources';
const ids=new Set(sources.map(s=>s.id));
if(ids.size!==sources.length)throw new Error('Sources dupliquées.');
for(const d of drugs){if(!drugClasses.some(c=>c.id===d.classId))throw new Error('Classe absente.');for(const field of [...Object.values(d.fields),...(d.referenceNotice?[d.referenceNotice]:[])])if(field.evidence.some(e=>!ids.has(e.sourceId)))throw new Error('Provenance inconnue.');}
for(const q of [...questions,...clinicalCases.flatMap(c=>c.steps.map(s=>s.question))])if(q.evidence.some(e=>!ids.has(e.sourceId))||q.drugIds.some(id=>!drugs.some(d=>d.id===id)))throw new Error('Question sans relation cohérente.');
const patterns=[/gh[pousr]_[A-Za-z0-9]{30,}/,/sk-[A-Za-z0-9]{30,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
async function scan(directory:string){for(const entry of await readdir(directory,{withFileTypes:true})){const path=join(directory,entry.name);if(entry.isDirectory())await scan(path);else if(/\.(tsx?|js|json|html|ya?ml)$/.test(entry.name)){const content=await readFile(path,'utf8');if(patterns.some(p=>p.test(content)))throw new Error(`Secret potentiel détecté dans ${path} (valeur non affichée).`);}}}
await scan('src');await scan('.github');await scan('dist');
const html=await readFile('dist/index.html','utf8');if(!html.includes('type="module"'))throw new Error('Build Vite absent.');
const data={drugs:drugs.length,classes:drugClasses.length,questions:questions.length,flashcards:flashcards.length,cases:clinicalCases.length,sources:sources.length,documentedFields:drugs.flatMap(d=>Object.values(d.fields)).filter(f=>f.status==='available').length};
console.log('Contrôles de livraison réussis :',JSON.stringify(data));
console.log('Recherche de motifs de secrets courants effectuée ; elle ne constitue pas un audit exhaustif.');
