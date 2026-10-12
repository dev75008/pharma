import { describe,it,expect } from 'vitest';
import { render,screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { flashcards } from '../../data/flashcards';
import { CardFace } from './Flashcards';
describe('Recto et verso',()=>{
 it('cache la réponse tant que le recto est affiché',()=>{render(<MemoryRouter><CardFace card={flashcards[0]} revealed={false}/></MemoryRouter>);expect(screen.getByRole('region',{name:'Recto de la carte'})).toBeVisible();expect(screen.queryByText(flashcards[0].back)).not.toBeInTheDocument();});
 it('affiche le verso, sa provenance et échappe les cartes personnelles',()=>{const card={...flashcards[0],back:'<img src=x onerror=alert(1)>',validationStatus:'personal-unverified' as const,evidence:[],personalSourceUrl:null};const {container}=render(<MemoryRouter><CardFace card={card} revealed={true}/></MemoryRouter>);expect(screen.getByText(card.back)).toBeVisible();expect(container.querySelector('img')).toBeNull();expect(screen.getByText('Provenance de la carte')).toBeVisible();});
});
