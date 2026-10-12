import { describe,it,expect } from 'vitest';
import { render,screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { questions } from '../../data/questions';
import { emptyAnswer,scoreAnswer } from '../../domain/assessment';
import { AnswerFields,Correction } from './Assessment';
import { useState } from 'react';
function Interactive(){const q=questions.find(q=>q.type==='qrm')!;const [a,setA]=useState(emptyAnswer(q));return <AnswerFields question={q} answer={a} onChange={setA} disabled={false}/>;}
describe('Composants d’évaluation',()=>{
 it('permet des choix multiples sans masquer le type de réponse',async()=>{render(<Interactive/>);const items=screen.getAllByRole('checkbox');await userEvent.click(items[0]);await userEvent.click(items[2]);expect(items[0]).toBeChecked();expect(items[2]).toBeChecked();expect(screen.getByRole('group')).toHaveAccessibleName('Plusieurs réponses possibles');});
 it('explique chaque proposition et présente la provenance',async()=>{const q=questions[0];const a={...emptyAnswer(q),selectedOptionIds:['b']};render(<MemoryRouter><Correction question={q} answer={a} score={scoreAnswer(q,a,'exact')}/></MemoryRouter>);expect(screen.getByText('Vrai · Récepteurs bêta-1')).toBeVisible();expect(screen.getByText('Faux · Facteur Xa')).toBeVisible();await userEvent.click(screen.getByText('Sources et objectifs pédagogiques'));expect(screen.getByText('Exemple de démonstration non validé · Niveau 1')).toBeVisible();});
});
