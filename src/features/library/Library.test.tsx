import { beforeEach,describe,it,expect } from 'vitest';
import { render,screen,within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Comparator,Library,ScientificValue } from './Library';
import { db } from '../../storage/db';
import { drugs } from '../../data/drugs';
beforeEach(async()=>{await db.favorites.clear();await db.history.clear();});
describe('Bibliothèque et fiches',()=>{
 it('affiche la provenance et une absence explicite',async()=>{render(<ScientificValue field={drugs[0].fields.dci}/>);await userEvent.click(screen.getByText('Source et vérification'));expect(screen.getByText(/Consulté le/)).toHaveTextContent('2026-10-12');expect(screen.getByRole('link')).toHaveAttribute('href',drugs[0].fields.dci.evidence[0]?.url);});
 it('combine filtre et recherche et gère les favoris',async()=>{const user=userEvent.setup();render(<MemoryRouter><Library/></MemoryRouter>);await screen.findByText('13 résultats');await user.selectOptions(screen.getByLabelText('Classe'),'iec-ara2');await user.type(screen.getByRole('searchbox'),'losartan');expect(screen.getByRole('status')).toHaveTextContent('1 résultat');await user.click(screen.getByRole('button',{name:'Favori : Losartan'}));await user.click(screen.getByLabelText('Mes favoris'));expect(await screen.findByRole('heading',{name:'Losartan'})).toBeVisible();expect(await db.favorites.get('losartan')).toBeDefined();});
 it('limite la sélection à quatre molécules sans données absentes inventées',async()=>{const user=userEvent.setup();render(<MemoryRouter><Comparator/></MemoryRouter>);for(const name of ['Bisoprolol','Ramipril','Losartan','Furosémide'])await user.click(screen.getByRole('checkbox',{name}));expect(screen.getByRole('checkbox',{name:'Rivaroxaban'})).toBeDisabled();expect(screen.getByRole('table')).toBeVisible();const row=screen.getByRole('rowheader',{name:'Demi-vie'}).closest('tr')!;expect(within(row).getAllByText('À documenter')).toHaveLength(3);expect(row).not.toHaveClass('documented-difference');});
});
