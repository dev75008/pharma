import type { Drug, FieldKey, ScientificField } from './models';
import { drugClasses } from '../data/drugs';
export const normalize = (value:string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').replace(/β/g,'beta').replace(/œ/g,'oe');
export const fieldText = (field:ScientificField) => field.status==='available'?field.value:'À documenter';
export interface LibraryFilters { query?:string; classId?:string; specialtyId?:string; systemId?:string; favoritesOnly?:boolean; }
const searchIndex=new WeakMap<Drug,{fields:Drug['fields'];version:string;text:string}>();
function indexedText(drug:Drug) {
 const cached=searchIndex.get(drug);
 if(cached&&cached.fields===drug.fields&&cached.version===drug.contentVersion)return cached.text;
 const text=normalize([drug.fields.dci.value,drugClasses.find(c=>c.id===drug.classId)?.label,...Object.values(drug.fields).filter(f=>f.status==='available').map(f=>f.value)].join(' '));
 searchIndex.set(drug,{fields:drug.fields,version:drug.contentVersion,text});return text;
}
export function searchDrugs(drugs:Drug[], filters:LibraryFilters={}, favoriteIds:string[]=[]) {
 const words=normalize(filters.query??'').trim().split(/\s+/).filter(Boolean);
 return drugs.filter(d=>(!filters.classId||d.classId===filters.classId)&&(!filters.specialtyId||d.specialtyIds.includes(filters.specialtyId))&&(!filters.systemId||d.systemIds.includes(filters.systemId))&&(!filters.favoritesOnly||favoriteIds.includes(d.id))&&words.every(word=>indexedText(d).includes(word)));
}

export function isStale(field:ScientificField, now=new Date(), maxAgeDays=180) { return field.status==='available' && field.evidence.some(e=>now.getTime()-new Date(e.consultedAt+'T00:00:00Z').getTime()>maxAgeDays*86400000); }
export const comparisonKeys: FieldKey[] = ['class','mechanism','indications','halfLife','metabolism','elimination','commonEffects','seriousEffects','contraindications','interactions','clinicalMonitoring','biologicalMonitoring'];
// Une différence textuelle n'est pas une supériorité clinique. Les champs manquants ne sont jamais comparés.
export function hasDocumentedDifference(drugs:Drug[], key:FieldKey) {return drugs.length>=2 && drugs.every(d=>d.fields[key].status==='available') && new Set(drugs.map(d=>fieldText(d.fields[key]))).size>1;}
export function validateComparisonIds(ids:string[], knownIds:string[]) {return Array.from(new Set(ids.filter(id=>knownIds.includes(id)))).slice(0,4);}
