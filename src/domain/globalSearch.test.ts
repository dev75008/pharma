import {expect,it} from 'vitest';
import {globalSearchRoute} from './globalSearch';
import {modules} from '../data/navigation';
import {drugClasses} from '../data/drugs';
it('distingue une famille exacte sans accents d’une fiche et d’un module',()=>{expect(globalSearchRoute('betabloquants',modules,drugClasses,[{id:'bisoprolol'}])).toBe('/classes/betabloquants');expect(globalSearchRoute(' Classes pharmacologiques ',modules,drugClasses,[])).toBe('/classes');expect(globalSearchRoute('bisoprolol',modules,drugClasses,[{id:'bisoprolol'}])).toBe('/medicaments/bisoprolol');});
it('conserve la recherche multi-molécule et encode la saisie non reconnue',()=>{expect(globalSearchRoute('angiotensine',modules,drugClasses,[{id:'ramipril'},{id:'losartan'}])).toBe('/bibliotheque?q=angiotensine');expect(globalSearchRoute('a&cis=123',modules,drugClasses,[])).toBe('/catalogue?q=a%26cis%3D123');});
