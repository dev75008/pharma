import {expect,it,vi,afterEach} from 'vitest';
import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {DailyPractice} from './DailyPractice';
import {emptyStudyData} from '../../domain/study';
import {createAssessment} from '../../storage/db';
vi.mock('../../storage/db',()=>({createAssessment:vi.fn()}));
afterEach(()=>vi.resetAllMocks());
function setup(loading=false,error=''){render(<MemoryRouter><Routes><Route path="/" element={<DailyPractice data={structuredClone(emptyStudyData)} day="2026-10-13" loading={loading} error={error}/>}/><Route path="/seances/:id" element={<h1>Séance enregistrée</h1>}/></Routes></MemoryRouter>);}
it('bloque le démarrage tant que les données personnelles sont indisponibles',()=>{setup(true);expect(screen.getByRole('button',{name:'Commencer ma séance quotidienne'})).toBeDisabled();expect(screen.queryByText(/Voir les 5 questions/)).not.toBeInTheDocument();});
it('prévisualise des raisons sans réponse et crée exactement la sélection au barème choisi',async()=>{const user=userEvent.setup();vi.mocked(createAssessment).mockResolvedValue({id:'daily'} as Awaited<ReturnType<typeof createAssessment>>);setup();await user.selectOptions(screen.getByLabelText('Questions de la séance quotidienne'),'10');await user.selectOptions(screen.getByLabelText('Barème de la séance quotidienne'),'partial');await user.click(screen.getByText('Voir les 10 questions et les raisons du choix'));expect(screen.getAllByText('Aucune correction enregistrée pour cette question sur cet appareil.')).toHaveLength(10);await user.click(screen.getByRole('button',{name:'Commencer ma séance quotidienne'}));expect(createAssessment).toHaveBeenCalledTimes(1);expect(vi.mocked(createAssessment).mock.calls[0][1]).toHaveLength(10);expect(vi.mocked(createAssessment).mock.calls[0][2]).toBe('partial');expect(await screen.findByRole('heading',{name:'Séance enregistrée'})).toBeVisible();});
it('signale l’échec du stockage et permet de réessayer',async()=>{const user=userEvent.setup();vi.mocked(createAssessment).mockRejectedValue(new Error('unavailable'));setup();await user.click(screen.getByRole('button',{name:'Commencer ma séance quotidienne'}));expect(await screen.findByRole('alert')).toHaveTextContent('ne peut pas être enregistrée');expect(screen.getByRole('button',{name:'Commencer ma séance quotidienne'})).toBeEnabled();});
