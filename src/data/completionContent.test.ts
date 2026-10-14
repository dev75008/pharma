import {expect,it} from 'vitest';
import {drugs} from './drugs';
import audit from './completion-audit.json';
import {questions} from './questions';
import {clinicalCases} from './clinicalCases';
import {documentationCoverage} from '../domain/documentationCoverage';
import {scientificFieldSchema} from '../domain/validation';
import {sources} from './sources';
import type {FieldKey} from '../domain/models';
const drug=(id:string)=>drugs.find(d=>d.id===id)!;
it('traite chaque rubrique du lot initial une seule fois sans faire passer une limite pour une donnée disponible',()=>{
 expect(audit.rows).toHaveLength(103);expect(new Set(audit.rows.map(r=>r.drugId+'/'+r.key)).size).toBe(103);
 for(const row of audit.rows){const f=drug(row.drugId).fields[row.key as FieldKey];expect(f.status==='available'?'documented':'source-limit').toBe(row.outcome);expect(row.evidence.every(e=>sources.some(s=>s.id===e.sourceId))).toBe(true);if(f.status==='missing'){expect(f.value).toBeNull();expect(f.verification).toBe('unverified');expect(f.absenceReview?.evidence.length).toBeGreaterThan(0);}}
 const r=documentationCoverage(drugs,questions,clinicalCases,'2026-10-14');expect(r.available).toBe(725);expect(r.total).toBe(750);expect(r.pedagogical).toBe(60);expect(r.reviewedMissing).toBe(25);expect(r.available-r.pedagogical).toBe(665);expect(r.reviewedQuestions).toBe(0);
});
it('garde les mécanismes incertains, métabolites toxiques et paramètres non rapportés sans inventer de valeur',()=>{
 for(const key of ['target','actionType','activeMetabolites'] as const)expect(drug('paracetamol').fields[key].status).toBe('missing');
 const metabolite=drug('paracetamol').fields.activeMetabolites;if(metabolite.status!=='missing')throw Error();expect(metabolite.reason).toContain('toxique');
 expect(drug('clopidogrel').fields.bioavailability.status).toBe('missing');
 expect(drug('ibuprofene').fields.bioavailability.status).toBe('missing');
 expect(drug('metformine').fields.target.value).toContain('sans démontrer');
 for(const id of ['metformine','paracetamol'])expect(drug(id).fields.doseResponse.status).toBe('missing');
});
it('sépare source américaine de cinétique, molécule/métabolites et biodisponibilité absolue/effet alimentaire',()=>{
 for(const key of ['bioavailability','proteinBinding','halfLife'] as const){const f=drug('spironolactone').fields[key];expect(f.status).toBe('available');expect(f.context).toContain('Source américaine');expect(f.evidence.every(e=>e.sourceId==='dailymed')).toBe(true);}
 expect(drug('spironolactone').fields.bioavailability.value).toContain('Ce n’est pas une biodisponibilité absolue');
 expect(drug('spironolactone').fields.halfLife.value).toContain('canrénone 16,5 h');
 expect(drug('furosemide').fields.bioavailability.value).toContain('voie IV uniquement');
 expect(drug('paracetamol').fields.bioavailability.value).toContain('100 % par définition');
});
it('conserve les contextes adulte et européens des effets fréquents et des restrictions d’apixaban',()=>{
 const d=drug('apixaban');expect(d.fields.commonEffects.value).toContain('Adulte FANV/traitement TVP–EP');
 for(const key of ['renalAdjustment','hepaticAdjustment','commonEffects','pregnancy','breastfeeding'] as const){const f=d.fields[key];expect(f.evidence[0].sourceId).toBe('ema');expect(f.evidence[0].locator).toContain('document anglais');expect(f.evidence[0].sourceUpdatedAt).toBeNull();}
 expect(d.fields.breastfeeding.value).toContain('inconnu');expect(d.fields.hepaticContext.value).toContain('coagulopathie');
});
it('identifie les aides mémoire comme créations pédagogiques et ne modifie pas les statuts de validation',()=>{
 for(const d of drugs){expect(d.validationStatus).toBe('documentary-summary');const f=d.fields.mnemonics;expect(f.status).toBe('available');if(f.status==='available'){expect(f.presentation).toBe('pedagogical');expect(f.context).toContain('non officielle');expect(f.evidence.length).toBeGreaterThan(0);}}
});
it('refuse une preuve vide ou une date invalide pour la limite, et une aide pédagogique sans source',()=>{
 const f=drug('paracetamol').fields.target;if(f.status!=='missing'||!f.absenceReview)throw Error('Limite absente.');
 expect(scientificFieldSchema.safeParse({...f,absenceReview:{...f.absenceReview,evidence:[]}}).success).toBe(false);
 expect(scientificFieldSchema.safeParse({...f,absenceReview:{...f.absenceReview,checkedAt:'2026-02-31'}}).success).toBe(false);
 expect(scientificFieldSchema.safeParse({...drug('bisoprolol').fields.mnemonics,evidence:[]}).success).toBe(false);
 expect(scientificFieldSchema.safeParse({...f,value:'invention'}).success).toBe(false);
});
