import {render,screen,fireEvent} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {PharmacoramaQuiz,PHARMACORAMA_QUIZ} from './PharmacoramaQuiz';
afterEach(()=>vi.restoreAllMocks());
it('charge sur demande, isole le site externe et permet de fermer le cadre',()=>{
 const {container}=render(<PharmacoramaQuiz/>);expect(container.querySelector('iframe')).toBeNull();
 expect(screen.getByRole('link',{name:'Ouvrir sur Pharmacorama (nouvel onglet)'})).toHaveAttribute('href',PHARMACORAMA_QUIZ);
 fireEvent.click(screen.getByRole('button',{name:'Afficher le quiz Pharmacorama'}));const frame=screen.getByTitle('Quiz original Pharmacorama');
 expect(frame).toHaveAttribute('src',PHARMACORAMA_QUIZ);expect(frame).toHaveAttribute('referrerpolicy','no-referrer');expect(frame.getAttribute('sandbox')).not.toContain('allow-top-navigation');
 fireEvent.load(frame);expect(screen.getByRole('status')).toHaveTextContent('Cadre externe chargé');
 fireEvent.click(screen.getByRole('button',{name:'Fermer le quiz intégré'}));expect(container.querySelector('iframe')).toBeNull();
});
it('signale le mode hors ligne et retire le cadre après perte de connexion',()=>{
 vi.spyOn(navigator,'onLine','get').mockReturnValue(true);const {container}=render(<PharmacoramaQuiz/>);
 fireEvent.click(screen.getByRole('button',{name:'Afficher le quiz Pharmacorama'}));
 vi.spyOn(navigator,'onLine','get').mockReturnValue(false);fireEvent(window,new Event('offline'));
 expect(container.querySelector('iframe')).toBeNull();expect(screen.getByRole('status')).toHaveTextContent('Hors ligne');expect(screen.getByRole('button',{name:'Recharger le quiz'})).toBeDisabled();
});
