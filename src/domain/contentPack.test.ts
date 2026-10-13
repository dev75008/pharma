import {expect,it} from 'vitest';
import {contentPackSchema,checkContentRelations} from './contentPack';
import raw from '../data/manual-content.json';
import {questions} from '../data/questions';
const known={sources:['bdpm'],classes:['betabloquants','anticoagulants','iec-ara2'],drugs:['bisoprolol','rivaroxaban','losartan'],specialties:['cardiologie'],systems:['cardiovasculaire']};
it('accepte le paquet vide versionné et un exercice sourcé légalement déclaré',()=>{const pack=contentPackSchema.parse({...raw,questions:[{...questions[0],id:'manual-beta'}]});expect(()=>checkContentRelations(pack,known)).not.toThrow();});
it('refuse fausse validation, source absente, collision et doublons',()=>{expect(()=>contentPackSchema.parse({...raw,questions:[{...questions[0],validationStatus:'reviewed'}]})).toThrow();expect(()=>contentPackSchema.parse({...raw,questions:[questions[0],questions[0]]})).toThrow();const pack=contentPackSchema.parse({...raw,questions:[questions[0]]});expect(()=>checkContentRelations(pack,{...known,sources:[]})).toThrow('sources');const bad=contentPackSchema.parse({...raw,sources:[{id:'bdpm',name:'X',url:'https://example.org',domain:'X',accessPolicy:'X',integrationStatus:'manual-summary'}]});expect(()=>checkContentRelations(bad,known)).toThrow('Collision');});
it('refuse version inconnue et URL non HTTPS',()=>{expect(()=>contentPackSchema.parse({...raw,schemaVersion:99})).toThrow();expect(()=>contentPackSchema.parse({...raw,sources:[{id:'a',name:'X',url:'javascript:alert(1)',domain:'X',accessPolicy:'X',integrationStatus:'manual-summary'}]})).toThrow();});
