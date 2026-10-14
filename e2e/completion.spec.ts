import {test,expect} from '@playwright/test';
test('limite scientifique explicite, référence examinée et valeur toujours absente',async({page})=>{
 await page.goto('/#/medicaments/paracetamol');
 const target=page.locator('.field-row').filter({has:page.getByText('Cible',{exact:true})});
 await expect(target).toContainText('À documenter');await expect(target).toContainText('Information non établie');
 await target.getByText('Référence examinée et limite').click();
 await expect(target.getByRole('link')).toHaveAttribute('href','https://base-donnees-publique.medicaments.gouv.fr/medicament/61304982/extrait');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('sécurité européenne d’apixaban contextualisée et aide mémoire signalée comme pédagogique',async({page})=>{
 await page.goto('/#/medicaments/apixaban');await page.getByText('Sécurité',{exact:true}).click();
 const effects=page.locator('.field-row').filter({has:page.getByText('Effets fréquents',{exact:true})});
 await expect(effects).toContainText('Adulte FANV/traitement TVP–EP');
 await effects.getByText('Source et vérification').click();await expect(effects).toContainText('document anglais');
 await page.getByText('Révision',{exact:true}).click();
 const mnemonic=page.locator('.field-row').filter({has:page.getByText('Moyens mnémotechniques (pédagogiques)',{exact:true})});
 await expect(mnemonic).toContainText('Création pédagogique');await expect(mnemonic).toContainText('non officielle');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('bilan exportable sépare données, aides pédagogiques et limites examinées',async({page})=>{
 await page.goto('/#/sources');const region=page.getByRole('region',{name:'Couverture et relecture documentaire'});
 await expect(region).toContainText('725 champs disponibles sur 750');
 await expect(region).toContainText('665 rubriques documentaires et 60 aides pédagogiques');
 const pending=page.waitForEvent('download');await region.getByRole('button',{name:'Exporter le bilan documentaire'}).click();
 const stream=await(await pending).createReadStream(),buffers=[];for await(const chunk of stream!)buffers.push(chunk);
 const report=JSON.parse(Buffer.concat(buffers).toString());expect(report.available).toBe(725);expect(report.reviewedMissing).toBe(25);
 const missing=report.drugs.flatMap((d:{missing:unknown[]})=>d.missing);expect(missing).toHaveLength(25);
 expect(missing.every((f:{absenceReview:{evidence:unknown[]}})=>f.absenceReview.evidence.length>0)).toBe(true);
});
