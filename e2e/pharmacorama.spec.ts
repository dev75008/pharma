import {test,expect} from '@playwright/test';
// Page synthétique de navigation : aucun contenu de question Pharmacorama reproduit.
const fixture='<html lang="fr"><body><h1>Ressource externe de test</h1><a href="?question=test">Choisir une question de test</a><form><label><input type="checkbox">Réponse de test</label><button type="button">Valider le test</button></form></body></html>';
test('quiz externe explicite, navigation dans le cadre et fermeture',async({page})=>{
 let calls=0;await page.route('https://www.pharmacorama.com/**',async route=>{calls++;await route.fulfill({contentType:'text/html',body:fixture});});
 await page.goto('/#/qcm');const section=page.getByRole('region',{name:'Quiz Pharmacorama'});await expect(section).toBeVisible();expect(calls).toBe(0);
 await section.getByRole('button',{name:'Afficher le quiz Pharmacorama'}).click();const frame=page.frameLocator('iframe[title="Quiz original Pharmacorama"]');await expect(frame.getByRole('heading')).toHaveText('Ressource externe de test');
 await frame.getByRole('link',{name:'Choisir une question de test'}).click();await frame.getByRole('checkbox').check();await expect(frame.getByRole('checkbox')).toBeChecked();await expect(page).toHaveURL(/#\/qcm$/);
 await expect(section.getByRole('link',{name:'Ouvrir sur Pharmacorama (nouvel onglet)'})).toHaveAttribute('target','_blank');await expect(section.getByText(/ne sont pas ajoutées à votre score/)).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await section.getByRole('button',{name:'Fermer le quiz intégré'}).click();await expect(page.locator('iframe')).toHaveCount(0);
 await page.goto('/#/examens');await expect(page.getByRole('region',{name:'Quiz Pharmacorama'})).toHaveCount(0);
});
test('indisponibilité externe : lien de secours et QCM locaux conservés',async({page,context})=>{
 await page.route('https://www.pharmacorama.com/**',route=>route.abort());await page.goto('/#/qcm');await page.getByRole('button',{name:'Afficher le quiz Pharmacorama'}).click();await expect(page.getByRole('link',{name:'Ouvrir sur Pharmacorama (nouvel onglet)'})).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await expect(page.getByRole('button',{name:'Commencer l’entraînement'})).toBeEnabled();await context.setOffline(true);
 await expect(page.getByRole('button',{name:'Afficher le quiz Pharmacorama'})).toBeDisabled();await expect(page.getByText(/Hors ligne : le quiz Pharmacorama/)).toBeVisible();await expect(page.getByRole('button',{name:'Commencer l’entraînement'})).toBeEnabled();
});
