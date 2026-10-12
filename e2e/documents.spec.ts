import { test, expect } from '@playwright/test';
import record from './fixtures/regulatory-drug.json' with { type:'json' };
import doc from './fixtures/rcp-excerpt.json' with { type:'json' };
const headers={'Content-Type':'application/json','Cache-Control':'max-age=3600'};

test('RCP par rubrique, source datée et consultation hors ligne',async({page,context})=>{
 let documentCalls=0;
 await page.route('https://medicaments-api.giygas.dev/**',async route=>{
  const document=route.request().url().endsWith('/rcp');if(document)documentCalls++;
  await route.fulfill({status:200,headers,body:JSON.stringify(document?doc:record)});
 });
 await page.goto('/#/catalogue?q=60524826&cis=60524826');
 await expect(page.getByRole('heading',{name:record.elementPharmaceutique})).toBeVisible();
 await page.getByRole('button',{name:'RCP et notice',exact:true}).click();
 await page.getByRole('button',{name:'Lire le RCP',exact:true}).click();
 await expect(page.getByText(/RCP\/notice mis à jour : 2025-10-20/)).toBeVisible();
 await page.getByLabel('Rubrique à lire').selectOption('4.1');
 await expect(page.locator('.source-document-html')).toContainText('hypertension artérielle');
 await expect(page.getByText(/recharger cette copie ne garantit pas/)).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.reload();await context.setOffline(true);await page.reload();
 await page.getByRole('button',{name:'Lire le RCP',exact:true}).click();
 await expect(page.getByText('Document téléchargé : lecture hors ligne.',{exact:false})).toBeVisible();
 await page.getByLabel('Rubrique à lire').selectOption('4.1');
 await expect(page.locator('.source-document-html')).toContainText('hypertension artérielle');expect(documentCalls).toBe(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('retour navigateur, URL de spécialité et reprises sans requête supplémentaire',async({page})=>{
 let calls=0;
 await page.route('https://medicaments-api.giygas.dev/**',async route=>{calls++;await route.fulfill({status:200,headers,body:JSON.stringify([record])});});
 await page.goto('/#/catalogue?q=bisoprolol');
 await page.getByRole('button',{name:/Voir la spécialité/}).click();
 await expect(page).toHaveURL(/cis=60524826/);
 await page.reload();await expect(page.getByRole('heading',{name:record.elementPharmaceutique})).toBeVisible();
 await page.getByRole('button',{name:'Retour aux résultats'}).click();
 await expect(page.getByRole('button',{name:/Voir la spécialité/})).toBeVisible();
 await page.goBack();await expect(page.getByRole('heading',{name:record.elementPharmaceutique})).toBeVisible();
 await page.goto('/#/catalogue');await page.getByRole('link',{name:/bisoprolol 1 résultat/}).click();
 await expect(page.getByRole('status')).toContainText('1 spécialité(s)');expect(calls).toBe(1);
});

test('lecture d’un RCP absent avec accès à la source et recherche globale au clavier',async({page})=>{
 await page.route('https://medicaments-api.giygas.dev/**',route=>route.fulfill({status:404,headers,body:'{"error":"Document not available"}'}));
 await page.goto('/#/medicaments/bisoprolol');
 await page.getByRole('button',{name:'Lire le RCP',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('n’est pas disponible dans la copie');
 await expect(page.getByRole('link',{name:'Consulter la source originale (nouvel onglet)'})).toBeVisible();
 const search=page.getByRole('textbox',{name:'Rechercher un module ou un médicament'});
 await search.fill('Ramipril');await search.press('Escape');await expect(search).toHaveValue('');
 await search.fill('Ramipril');await search.press('Enter');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Ramipril');
});
