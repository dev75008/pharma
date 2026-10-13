import { test,expect } from '@playwright/test';

test('chimie sourcée, contexte de formulation et image disponibles hors ligne',async({page,context})=>{
 await page.goto('/#/medicaments/paracetamol');
 await page.getByText('Pharmacocinétique',{exact:true}).click();
 await expect(page.getByText('Environ 2,7 h chez l’adulte.',{exact:true})).toBeVisible();
 await page.getByText('Chimie',{exact:true}).click();
 await expect(page.getByText('C8H9NO2',{exact:true})).toBeVisible();
 await expect(page.getByText(/ne représente pas nécessairement le sel/).first()).toBeVisible();
 const image=page.getByRole('img',{name:'Structure chimique 2D PubChem ; entité précisée dans la provenance'});
 await expect(image).toBeVisible();
 await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth===300)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.reload();
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await context.setOffline(true);
 await page.reload();
 await page.getByText('Chimie',{exact:true}).click();
 await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth===300)).toBe(true);
});
test('parcours bibliothèque, favoris, notes, progression et historique persistants',async({page})=>{
 await page.goto('/#/bibliotheque');await page.getByLabel('Classe',{exact:true}).selectOption('iec-ara2');await page.getByRole('searchbox').fill('ramipril');await expect(page.getByRole('status')).toContainText('1 résultat');await page.getByRole('link',{name:'Ramipril',exact:true}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('Ramipril');await expect(page.locator('header')).toBeInViewport();await page.getByRole('button',{name:'Ajouter aux favoris'}).click();await page.getByRole('button',{name:'Marquer comme étudiée'}).click();await page.getByLabel('Note personnelle').fill('<script>note de révision</script>');await page.getByRole('button',{name:'Enregistrer la note'}).click();await expect(page.getByRole('status')).toContainText('Note enregistrée');await page.reload();await expect(page.getByRole('button',{name:'Retirer des favoris'})).toBeVisible();await expect(page.getByRole('button',{name:'Fiche étudiée'})).toBeVisible();await expect(page.getByLabel('Note personnelle')).toHaveValue('<script>note de révision</script>');expect(await page.locator('script').filter({hasText:'note de révision'}).count()).toBe(0);
 await page.goto('/#/bibliotheque');await page.getByLabel('Mes favoris').check();await expect(page.getByRole('heading',{name:'Ramipril',exact:true})).toBeVisible();await page.getByRole('button',{name:'Consultations récentes'}).click();await expect(page.getByRole('status')).toContainText('1 résultat');await page.goto('/#/tableau-de-bord');await expect(page.locator('.metric').filter({hasText:'Fiches étudiées'}).locator('strong')).toHaveText('1');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('recherche globale, provenance et fiche inconnue',async({page})=>{await page.goto('/');await page.getByRole('textbox',{name:'Rechercher un module ou un médicament'}).fill('beta-1');await page.getByRole('link',{name:'Bisoprolol Fiche'}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('Bisoprolol');await expect(page).toHaveTitle('Bisoprolol · MEDREVISION');await page.getByText('Source et vérification',{exact:true}).first().click();await expect(page.getByText('Consulté le 2026-10-12',{exact:false}).first()).toBeVisible();await page.goto('/#/medicaments/inconnue');await expect(page.getByRole('heading',{level:1})).toHaveText('Médicament introuvable');});
test('comparateur 2 à 4, impression et consultation hors ligne',async({page,context})=>{await page.goto('/#/comparateur');for(const name of ['Bisoprolol','Ramipril','Losartan','Furosémide'])await page.getByRole('checkbox',{name}).check();await expect(page.getByRole('checkbox',{name:'Metformine'})).toBeDisabled();await expect(page.getByRole('table')).toBeVisible();await page.evaluate(()=>{window.print=()=>{document.body.dataset.printed='yes';};});await page.getByRole('button',{name:'Imprimer / enregistrer en PDF'}).click();await expect(page.locator('body')).toHaveAttribute('data-printed','yes');await page.emulateMedia({media:'print'});await expect(page.locator('.print-evidence').first()).toBeVisible();await expect(page.getByRole('button',{name:'Imprimer / enregistrer en PDF'})).toBeHidden();await page.emulateMedia({media:'screen'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);await context.setOffline(true);await page.goto('/#/medicaments/metformine');await expect(page.getByRole('heading',{level:1})).toHaveText('Metformine');await page.getByText('Pharmacocinétique',{exact:true}).click();await expect(page.getByText('Environ 6,5 heures : demi-vie apparente terminale après administration orale ; allongée en insuffisance rénale.',{exact:true})).toBeVisible();});
