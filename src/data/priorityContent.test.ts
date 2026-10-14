import {expect, it} from 'vitest';
import {drugs} from './drugs';
import {questions} from './questions';
import {flashcards} from './flashcards';
import {clinicalCases} from './clinicalCases';
import {priorityQuestions} from './priorityQuestions';
import {parseDrugs} from '../domain/validation';
import {parseQuestions, scoreAnswer} from '../domain/assessment';

it('conserve populations, formulations et paramètres distincts dans les nouvelles rubriques', () => {
  const fields = (id: string) => drugs.find(d => d.id === id)!.fields;
  expect(fields('bisoprolol').clinicalContexts.value).toContain('Ce dosage');
  expect(fields('levetiracetam').clinicalContexts.value).toContain('16 ans');
  expect(fields('ibuprofene').clinicalContexts.value).toContain('12 ans et 40 kg');
  expect(fields('spironolactone').renalContext.value).toContain('chez l’enfant');
  expect(fields('spironolactone').halfLife.status).toBe('missing');
  expect(fields('spironolactone').therapeuticEffects.value).toContain('ne sont pas une demi-vie');
});
it('chaque nouvel exercice garde une source disponible et une correction déterministe sans validation inventée', () => {
  parseQuestions(priorityQuestions);
  for (const q of priorityQuestions) {
    expect(scoreAnswer(q, {questionId: q.id, selectedOptionIds: q.options.filter(o => o.correct).map(o => o.id)}, 'exact').score).toBe(1);
    expect(q.validationStatus).toBe('demo');
    expect(q.options.every(o => o.explanation.length > 0)).toBe(true);
    expect(q.evidence.every(e => q.drugIds.some(id => Object.values(drugs.find(d => d.id === id)!.fields).some(f => f.evidence.some(p => p.url === e.url && p.locator === e.locator))))).toBe(true);
  }
});
it('ne transfère pas une abrogation de spécialité à toute la DCI, ni sa date à celle du RCP', () => {
  const drug = drugs.find(d => d.id === 'sertraline')!;
  expect(drug.referenceNotice?.value).toContain('30 septembre 2024');
  expect(drug.referenceNotice?.context).toContain('ne signifie pas');
  expect(drug.referenceNotice?.evidence[0].sourceUpdatedAt).toBeNull();
  expect(drug.fields.brands.evidence[0].sourceUpdatedAt).toBe('2023-06-19');
  for (const q of questions.filter(q => q.drugIds.includes(drug.id))) expect(q.correction).toContain('Référence historique');
  for (const card of flashcards.filter(c => c.drugIds.includes(drug.id))) expect(card.back).toContain('Référence historique');
  for (const dossier of clinicalCases.filter(c => c.steps.some(s => s.question.drugIds.includes(drug.id)))) expect(dossier.introduction).toContain('Référence historique');
});
it('refuse une réserve documentaire sans provenance ou avec une fausse relecture indépendante', () => {
  const drug = drugs.find(d => d.id === 'sertraline')!;
  expect(() => parseDrugs([{...drug, referenceNotice: {...drug.referenceNotice, evidence: []}}])).toThrow();
  expect(() => parseDrugs([{...drug, referenceNotice: {...drug.referenceNotice, verification: 'independently-reviewed'}}])).toThrow();
});
