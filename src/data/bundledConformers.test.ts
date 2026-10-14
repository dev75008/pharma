import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {expect,it} from 'vitest';
import {bundledConformers,verifyBundledConformer,bundledManifestSchema} from './bundledConformers';
import {drugs} from './drugs';
const cryptoApi=webcrypto as unknown as Crypto;
it('les quinze copies incluses ont une identité, un graphe et une empreinte cohérents',async()=>{expect(bundledConformers.items).toHaveLength(15);for(const item of bundledConformers.items){const entry=await verifyBundledConformer(item.cid,await readFile('public/'+item.assetPath,'utf8'),cryptoApi);expect(entry.retrievedAt).toBe(item.retrievedAt);expect(entry.sourceUpdatedAt).toBeNull();const drug=drugs.find(d=>d.id===item.drugId)!;expect(drug.fields.structure3d.value).toBe(item.url);expect(drug.fields.structure3d.context).toContain('calculé');expect(drug.validationStatus).toBe('documentary-summary');}});
it('refuse une copie altérée et un manifeste qui redirige vers un autre chemin',async()=>{const item=bundledConformers.items[0];const raw=await readFile('public/'+item.assetPath,'utf8');await expect(verifyBundledConformer(item.cid,raw.replace('PUBCHEM_COMPOUND_CID','CID_ALTERE'),cryptoApi)).rejects.toThrow();expect(bundledManifestSchema.safeParse({...bundledConformers,items:[{...item,assetPath:'conformers/autre.txt'}]}).success).toBe(false);const win=raw.replace(/\n/g,'\r\n');expect((await verifyBundledConformer(item.cid,win,cryptoApi)).cid).toBe(item.cid);});
