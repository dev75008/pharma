import { test, expect } from '@playwright/test';
import record from './fixtures/regulatory-drug.json' with { type: 'json' };
const api='https://medicaments-api.giygas.dev/**';
const headers={'Content-Type':'application/json','Cache-Control':'public, max-age=3600','Last-Modified':'Mon, 12 Oct 2026 18:00:01 GMT'};

test('catalogue par nom, détails sourcés, cache et rechargement hors ligne',async({page,context})=>{
 let calls=0;
 await page.route(api,async route=>{calls++;await route.fulfill({status:200,headers,body:JSON.stringify([record])});});
 await page.goto('/#/catalogue');
 await page.getByLabel('Nom, CIS ou CIP').fill('Bisoprolol');
 await page.getByRole('button',{name:'Rechercher dans la BDPM'}).click();
 await expect(page.getByRole('status')).toContainText('1 spécialité(s)');
 await page.getByRole('button',{name:/Voir la spécialité/}).click();
 await expect(page.getByRole('heading',{name:record.elementPharmaceutique})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Composition déclarée'})).toBeVisible();
 await expect(page.getByText('BISOPROLOL (FUMARATE ACIDE DE)',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.reload();await expect(page.getByRole('status')).toContainText('1 spécialité(s)');await expect(page.getByRole('heading',{name:record.elementPharmaceutique})).toBeVisible();
 expect(calls).toBe(1);
 await context.setOffline(true);await page.reload();
 await expect(page.getByText('Consultation hors ligne de la copie téléchargée.')).toBeVisible();
 await expect(page.getByRole('heading',{name:record.elementPharmaceutique})).toBeVisible();
});

test('CIS et CIP précis et conservation de la copie après panne',async({page})=>{
 let failed=false;
 await page.route(api,async route=>route.fulfill(failed?{status:503,body:'Service indisponible'}:{status:200,headers,body:JSON.stringify(record)}));
 await page.goto('/#/catalogue?q=60524826');
 await expect(page.getByRole('status')).toContainText('1 spécialité(s)');
 failed=true;await page.getByRole('button',{name:'Actualiser depuis l’API'}).click();
 await expect(page.getByText(/Copie précédente conservée/)).toBeVisible();
 failed=false;
 await page.getByLabel('Nom, CIS ou CIP').fill('3400935609816');
 await page.getByRole('button',{name:'Rechercher dans la BDPM'}).click();
 await expect(page.getByRole('status')).toContainText('1 spécialité(s)');
 await page.getByRole('button',{name:/Voir la spécialité/}).click();
 await expect(page.getByText(/CIP13 : 3400935609816/)).toBeVisible();
});

test('complément réglementaire sur la bonne fiche, sans modifier sa synthèse clinique',async({page})=>{
 let calls=0;
 await page.route(api,async route=>{calls++;expect(route.request().url()).toContain('/v1/medicaments/60524826');await route.fulfill({status:200,headers,body:JSON.stringify(record)});});
 await page.goto('/#/medicaments/bisoprolol');
 expect(calls).toBe(0);
 await page.getByRole('button',{name:'Charger les données BDPM'}).click();
 await expect(page.getByRole('heading',{name:record.elementPharmaceutique})).toBeVisible();
 await expect(page.locator('.content-version')).toContainText('2026.10.12-2');
 await expect(page.getByText(/Concordance documentaire/).first()).toBeVisible();
 expect(calls).toBe(1);
});

test('429 et saisie invalide ne déclenchent pas de boucle réseau',async({page})=>{
 let calls=0;
 await page.route(api,async route=>{calls++;await route.fulfill({status:429,headers:{'Retry-After':'30'},body:'Too Many Requests'});});
 await page.goto('/#/catalogue');
 await page.getByLabel('Nom, CIS ou CIP').fill('ab');await page.getByRole('button',{name:'Rechercher dans la BDPM'}).click();
 await expect(page.getByRole('alert')).toContainText('Saisissez');expect(calls).toBe(0);
 await page.getByLabel('Nom, CIS ou CIP').fill('ramipril');await page.getByRole('button',{name:'Rechercher dans la BDPM'}).click();
 await expect(page.getByRole('alert')).toContainText('limite temporairement');
 await page.getByRole('button',{name:'Rechercher dans la BDPM'}).click();
 await expect(page.getByRole('alert')).toContainText('Limite de requêtes');expect(calls).toBe(1);
});
