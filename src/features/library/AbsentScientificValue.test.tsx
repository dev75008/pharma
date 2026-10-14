import {expect,it} from 'vitest';
import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AbsentScientificValue} from './AbsentScientificValue';
import {drugs} from '../../data/drugs';
it('montre la limite et permet de vérifier la référence sans afficher une valeur supposée',async()=>{
 const field=drugs.find(d=>d.id==='paracetamol')!.fields.target;if(field.status!=='missing')throw Error();
 render(<AbsentScientificValue field={field}/>);
 expect(screen.getByText('À documenter',{exact:false})).toBeVisible();
 expect(screen.getByText(/Information non établie/)).toBeVisible();
 await userEvent.click(screen.getByText('Référence examinée et limite'));
 expect(screen.getByRole('link')).toHaveAttribute('href','https://base-donnees-publique.medicaments.gouv.fr/medicament/61304982/extrait');
 expect(screen.getByText(/aucune conclusion d’absence de risque ou d’effet/)).toBeVisible();
});
