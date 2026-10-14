import {expect,it} from 'vitest';
import {contentPackSchema,checkContentRelations} from './contentPack';
import raw from '../data/manual-content.json';
import {questions} from '../data/questions';
import {drugs} from '../data/drugs';
import {sources} from '../data/sources';
const known={sources:['bdpm'],classes:['betabloquants','anticoagulants','iec-ara2'],drugs:['bisoprolol','rivaroxaban','losartan'],specialties:['cardiologie'],systems:['cardiovasculaire']};
it('accepte le paquet vide versionné et un exercice sourcé légalement déclaré',()=>{const pack=contentPackSchema.parse({...raw,questions:[{...questions[0],id:'manual-beta'}]});expect(()=>checkContentRelations(pack,known)).not.toThrow();});
it('refuse fausse validation, source absente, collision et doublons',()=>{expect(()=>contentPackSchema.parse({...raw,questions:[{...questions[0],validationStatus:'reviewed'}]})).toThrow();expect(()=>contentPackSchema.parse({...raw,questions:[questions[0],questions[0]]})).toThrow();const pack=contentPackSchema.parse({...raw,questions:[questions[0]]});expect(()=>checkContentRelations(pack,{...known,sources:[]})).toThrow('sources');const bad=contentPackSchema.parse({...raw,sources:[{id:'bdpm',name:'X',url:'https://example.org',domain:'X',accessPolicy:'X',integrationStatus:'manual-summary'}]});expect(()=>checkContentRelations(bad,known)).toThrow('Collision');});
it('refuse version inconnue et URL non HTTPS',()=>{expect(()=>contentPackSchema.parse({...raw,schemaVersion:99})).toThrow();expect(()=>contentPackSchema.parse({...raw,sources:[{id:'a',name:'X',url:'javascript:alert(1)',domain:'X',accessPolicy:'X',integrationStatus:'manual-summary'}]})).toThrow();});
it('refuse une source inconnue dissimulée dans la preuve d’examen d’un champ absent',()=>{
 const drug=structuredClone(drugs.find(d=>d.id==='bisoprolol')!);drug.id='manual-source-limit';
 const f=drug.fields.doseResponse;if(f.status!=='missing'||!f.absenceReview)throw Error();
 const pack=contentPackSchema.parse({...raw,drugs:[drug]});const references={...known,sources:sources.map(s=>s.id)};
 expect(()=>checkContentRelations(pack,references)).not.toThrow();
 f.absenceReview.evidence[0].sourceId='source-inconnue';
 const bad=contentPackSchema.parse({...raw,drugs:[drug]});expect(()=>checkContentRelations(bad,references)).toThrow('sources');
});
