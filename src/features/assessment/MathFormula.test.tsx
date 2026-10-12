import { describe,it,expect } from 'vitest';
import { renderSafeFormula } from './MathFormula';
describe('Équations sécurisées',()=>{it('rend HTML et MathML sans autoriser les commandes de liens ou images externes',()=>{const html=renderSafeFormula(String.raw`100 \times (1/2)^3`);expect(html).toContain('katex');expect(html).toContain('<math');const malicious=renderSafeFormula(String.raw`\href{javascript:alert(1)}{x}`);const container=document.createElement('div');container.innerHTML=malicious;expect(container.querySelector('a,script,img')).toBeNull();});});
