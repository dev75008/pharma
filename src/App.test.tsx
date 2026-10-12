import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
vi.mock('./storage/db', () => ({ defaultPreferences: { id: 'user', theme: 'light', weeklyGoal: 120 }, readPreferences: vi.fn(async () => ({ id: 'user', theme: 'light', weeklyGoal: 120 })), savePreferences: vi.fn(async () => {}) }));
import { readPreferences, savePreferences } from './storage/db';
beforeEach(()=>vi.clearAllMocks());
describe('Architecture phase 1',()=>{
 it('affiche un accueil sans réussite inventée',async()=>{render(<MemoryRouter><App/></MemoryRouter>);expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Vos connaissances');expect(screen.getByText('—')).toBeVisible();await screen.findByRole('button',{name:'Activer le mode sombre'});});
 it('cherche et ouvre un module avec statut explicite',async()=>{const user=userEvent.setup();render(<MemoryRouter><App/></MemoryRouter>);await user.type(screen.getByRole('textbox',{name:'Rechercher un module'}),'Comparateur');await user.click(screen.getAllByRole('link',{name:'Comparateur'})[1]);expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Comparateur');expect(screen.getByText('Disponible après la phase 2')).toBeVisible();});
 it('enregistre le thème et affiche une erreur de stockage',async()=>{vi.mocked(savePreferences).mockRejectedValueOnce(new Error('denied'));const user=userEvent.setup();render(<MemoryRouter><App/></MemoryRouter>);await user.click(await screen.findByRole('button',{name:'Activer le mode sombre'}));expect(await screen.findByRole('alert')).toHaveTextContent('Enregistrement impossible');expect(document.documentElement.dataset.theme).toBe('dark');});
 it('gère les adresses inconnues',async()=>{render(<MemoryRouter initialEntries={['/absent']}><App/></MemoryRouter>);expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Page introuvable');expect(readPreferences).toHaveBeenCalled();});
});
