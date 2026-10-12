import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { DrugRoute } from './Library';
import { saveNote } from '../../storage/db';

vi.mock('../../storage/useLibraryState', () => ({ useLibraryState: () => ({
 data: { favorites: [], history: [], progress: [], notes: [] }, error: '', loading: false,
}) }));
vi.mock('../../storage/db', async (original) => ({
 ...await original<typeof import('../../storage/db')>(),
 recordVisit: vi.fn(async () => {}), saveNote: vi.fn(async () => {}),
}));

it('conserve le texte enregistré en attendant le nouvel instantané IndexedDB', async () => {
 const user = userEvent.setup();
 render(<MemoryRouter initialEntries={['/medicaments/ramipril']}><Routes><Route path="/medicaments/:id" element={<DrugRoute/>}/></Routes></MemoryRouter>);
 const textarea = screen.getByRole('textbox', { name: 'Note personnelle' });
 await user.type(textarea, 'Ma note de révision');
 const save = screen.getByRole('button', { name: 'Enregistrer la note' });
 await waitFor(() => expect(save).toBeEnabled());
 await user.click(save);
 await screen.findByText('Note enregistrée');
 expect(saveNote).toHaveBeenCalledWith('ramipril', 'Ma note de révision');
 expect(textarea).toHaveValue('Ma note de révision');
});
