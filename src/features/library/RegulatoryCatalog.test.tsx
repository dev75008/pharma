import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import record from '../../../e2e/fixtures/regulatory-drug.json';
import { RegulatoryRecord } from './RegulatoryCatalog';

it('ne transforme pas un prix absent en gratuité, ni des conditions absentes en vente libre',()=>{
 render(<MemoryRouter><RegulatoryRecord record={{...record,conditions:null,presentation:[{...record.presentation[0],prix:0}],generiques:null}}/></MemoryRouter>);
 expect(screen.getByText(/absence d’information ne signifie pas vente libre/)).toBeVisible();
 expect(screen.getByText('Prix hors honoraires déclaré : Non renseigné.')).toBeVisible();
 expect(screen.getByRole('link',{name:'Consulter la BDPM et le RCP (nouvel onglet)'})).toHaveAttribute('href','https://base-donnees-publique.medicaments.gouv.fr/medicament/60524826/extrait');
});
