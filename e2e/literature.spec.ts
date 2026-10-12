import {test,expect} from '@playwright/test';
import fixture from './fixtures/europe-pmc.json' with {type:'json'};
test('bibliographie explicite, sans chargement automatique, puis hors ligne',async({page,context})=>{
 let calls=0;await page.route('https://www.ebi.ac.uk/europepmc/**',async route=>{calls++;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)});});
 await page.goto('/#/medicaments/bisoprolol');const section=page.getByRole('region',{name:'Publications scientifiques'});
 await expect(section).toBeVisible();expect(calls).toBe(0);
 await section.getByRole('button',{name:'Rechercher les publications'}).click();
 await expect(section.getByText(/2049 références trouvées/)).toBeVisible();await expect(section.getByRole('listitem')).toHaveCount(10);
 await expect(section.getByText(/Aucune recommandation française/)).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await context.setOffline(true);await page.reload();
 await section.getByRole('button',{name:'Rechercher les publications'}).click();await expect(section.getByText(/consultation hors ligne/)).toBeVisible();expect(calls).toBe(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('bibliographie indisponible et sources américaines explicitement distinguées',async({page})=>{
 await page.route('https://www.ebi.ac.uk/europepmc/**',route=>route.fulfill({status:503}));
 await page.goto('/#/medicaments/paracetamol');await page.getByRole('button',{name:'Rechercher les publications'}).click();
 await expect(page.getByRole('alert')).toContainText('HTTP 503');
 await page.goto('/#/sources');await expect(page.getByRole('heading',{name:'OpenFDA'})).toBeVisible();await expect(page.getByText('États-Unis — étiquetages et pharmacovigilance FDA')).toBeVisible();
});
