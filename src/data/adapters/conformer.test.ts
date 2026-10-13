import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {conformerSchema,conformerUrl,parseConformer} from './conformer';
const sdf=readFileSync('e2e/fixtures/pubchem-bisoprolol-3d.sdf','utf8');
it('valide le conformère PubChem réel et contrôle son CID',()=>{expect(parseConformer(sdf,2405)).toEqual({atoms:54,bonds:54});expect(()=>parseConformer(sdf,1983)).toThrow('CID');expect(()=>parseConformer(sdf+sdf,2405)).toThrow('seul');expect(()=>parseConformer(sdf.replace('3D','2D'),2405)).toThrow('3D');});
it('refuse une provenance et des coordonnées incohérentes',()=>{const value={key:'sdf:2405',cid:2405,url:conformerUrl(2405),sourceId:'pubchem',sdf,retrievedAt:new Date().toISOString(),expiresAt:Date.now()+86400000,sourceUpdatedAt:null};expect(conformerSchema.safeParse(value).success).toBe(true);expect(conformerSchema.safeParse({...value,key:'sdf:1983'}).success).toBe(false);expect(()=>parseConformer(sdf.replace('3.2498','NaN   '),2405)).toThrow('coordonnées');});
