import {expect,it} from 'vitest';
import {documentationCoverage} from './documentationCoverage';
import {drugs} from '../data/drugs';
import {questions} from '../data/questions';
import {clinicalCases} from '../data/clinicalCases';
it('compte les données réellement disponibles et sépare documentation et validation',()=>{const r=documentationCoverage(drugs,questions,clinicalCases,'2026-10-14');expect(r.total).toBe(drugs.length*50);expect(r.available).toBe(drugs.flatMap(d=>Object.values(d.fields)).filter(f=>f.status==='available').length);expect(r.reviewedQuestions).toBe(0);expect(r.drugs.every(d=>!d.independentlyReviewed)).toBe(true);expect(r.drugs.find(d=>d.drugId==='apixaban')?.questions).toBeGreaterThan(0);});
it('demande une relecture selon la consultation, sans inventer une mise à jour',()=>{const old=structuredClone(drugs.find(d=>d.id==='apixaban')!);old.fields.dci.evidence[0].consultedAt='2026-01-01';old.fields.dci.evidence[0].sourceUpdatedAt='2026-10-14';const r=documentationCoverage([old],[],[],'2026-10-14');expect(r.drugs[0].needsReview).toEqual(['dci']);expect(r.drugs[0].missing).toEqual([]);expect(old.fields.dci.evidence[0].sourceUpdatedAt).toBe('2026-10-14');});
