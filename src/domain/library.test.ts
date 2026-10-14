import { describe,it,expect } from 'vitest';
import { drugs,drugClasses,indications,molecularTargets } from '../data/drugs';
import { parseDrugs,scientificFieldSchema } from './validation';
import { searchDrugs,hasDocumentedDifference,isStale,validateComparisonIds } from './library';
import { sources } from '../data/sources';
describe('Données médicales et provenance',()=>{
 it('valide les 13 fiches et les relations stables sans validation médicale inventée',()=>{expect(parseDrugs(drugs)).toHaveLength(15);for(const d of drugs){expect(drugClasses.some(c=>c.id===d.classId)).toBe(true);expect(d.validationStatus).toBe('documentary-summary');expect(d.targetIds.every(id=>molecularTargets.some(t=>t.id===id))).toBe(true);expect(d.indicationIds.every(id=>indications.some(i=>i.id===id))).toBe(true);for(const f of Object.values(d.fields)){if(f.status==='available'){expect(f.evidence.every(e=>sources.some(s=>s.id===e.sourceId))).toBe(true);expect(f.verification).toBe('source-checked');}else expect(f.value).toBeNull();}}});
 it('refuse les champs renseignés sans preuve, URL dangereuse, date invalide et doublons',()=>{const f=drugs[0].fields.dci;if(f.status!=='available')throw Error();expect(scientificFieldSchema.safeParse({...f,evidence:[]}).success).toBe(false);expect(scientificFieldSchema.safeParse({...f,evidence:[{...f.evidence[0],url:'javascript:alert(1)'}]}).success).toBe(false);expect(scientificFieldSchema.safeParse({...f,evidence:[{...f.evidence[0],consultedAt:'2026-02-31'}]}).success).toBe(false);expect(()=>parseDrugs([drugs[0],drugs[0]])).toThrow('dupliqués');});
 it('signale la consultation ancienne sans considérer une date RCP ancienne comme une nouvelle consultation',()=>{expect(isStale(drugs[0].fields.dci,new Date('2026-10-13'))).toBe(false);expect(isStale(drugs[0].fields.dci,new Date('2027-10-13'))).toBe(true);expect(isStale(drugs[0].fields.doseResponse,new Date('2027-10-13'))).toBe(false);});
});
describe('Recherche et comparaison',()=>{
 it('une DCI exacte reste précise même lorsqu’une autre fiche la cite en comparaison',()=>{expect(searchDrugs(drugs,{query:'losartan'}).map(d=>d.id)).toEqual(['losartan']);expect(searchDrugs(drugs,{query:'losartan',classId:'anticoagulants'})).toEqual([]);expect(searchDrugs(drugs,{query:'angiotensine',classId:'iec-ara2'}).map(d=>d.id)).toEqual(['ramipril','losartan']);expect(searchDrugs(drugs,{query:'AT1'}).map(d=>d.id)).toEqual(['losartan']);});
 it('actualise l’index après une nouvelle version documentaire',()=>{
  const drug=structuredClone(drugs[0]);
  expect(searchDrugs([drug],{query:'marqueur-new'})).toHaveLength(0);
  const field=drug.fields.mechanism;if(field.status!=='available')throw Error();
  field.value+=' marqueur-new';drug.contentVersion+='-updated';
  expect(searchDrugs([drug],{query:'marqueur-new'})).toHaveLength(1);
 });
 it('cherche sans accents et combine classe, spécialité, système et favoris',()=>{expect(searchDrugs(drugs,{query:'betabloquant beta-1'}).map(d=>d.id)).toEqual(['bisoprolol']);expect(searchDrugs(drugs,{query:'angiotensine',classId:'iec-ara2',specialtyId:'cardiologie',systemId:'cardiovasculaire',favoritesOnly:true},['losartan']).map(d=>d.id)).toEqual(['losartan']);expect(searchDrugs(drugs,{query:'DFG'}).map(d=>d.id)).toContain('metformine');expect(searchDrugs(drugs,{classId:'inconnue'})).toEqual([]);});
 it('ne compare pas une valeur absente et limite à quatre identifiants uniques connus',()=>{expect(hasDocumentedDifference(drugs.slice(0,2),'mechanism')).toBe(true);expect(hasDocumentedDifference(drugs.slice(0,2),'halfLife')).toBe(true);expect(hasDocumentedDifference(drugs.slice(0,2),'doseResponse')).toBe(false);expect(hasDocumentedDifference([drugs[0]],'class')).toBe(false);expect(validateComparisonIds(['absent',...drugs.map(d=>d.id),'bisoprolol'],drugs.map(d=>d.id))).toEqual(drugs.slice(0,4).map(d=>d.id));});
});
