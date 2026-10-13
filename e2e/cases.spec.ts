import {test,expect} from '@playwright/test';
test('dossier progressif, étapes masquées, reprise et bilan persistants',async({page})=>{
 await page.goto('/#/cas-cliniques');await page.getByRole('button',{name:'Commencer Metformine et fonction rénale'}).click();
 await expect(page.getByRole('heading',{name:'Comprendre le traitement',exact:true})).toBeVisible();await expect(page.getByText(/Le laboratoire fictif fournit/)).toHaveCount(0);
 await page.getByRole('checkbox',{name:'Elle diminue la production hépatique de glucose.'}).check();await page.getByRole('checkbox',{name:'Elle est éliminée dans les urines sous forme inchangée.'}).check();
 await page.getByRole('button',{name:'Enregistrer sans valider'}).click();await expect(page.getByRole('status')).toHaveText('Réponse enregistrée');await page.reload();await expect(page.getByRole('checkbox',{name:'Elle diminue la production hépatique de glucose.'})).toBeChecked();
 await page.getByRole('button',{name:'Valider l’étape et corriger'}).click();await expect(page.getByRole('checkbox').first()).toBeDisabled();
 await page.getByRole('button',{name:'Découvrir l’étape suivante'}).click();await expect(page.getByText(/Le laboratoire fictif fournit/)).toBeVisible();
 await page.getByRole('radio',{name:'Contre-indication pour DFG < 30 mL/min'}).check();await page.getByRole('button',{name:'Valider l’étape et corriger'}).click();await page.getByRole('button',{name:'Découvrir l’étape suivante'}).click();
 await page.getByRole('radio',{name:'Évaluer le DFG avant le traitement et régulièrement ensuite.'}).check();await page.getByRole('button',{name:'Valider l’étape et corriger'}).click();await page.getByRole('button',{name:'Terminer le dossier'}).click();
 await expect(page.getByRole('heading',{name:'Bilan du dossier'})).toBeVisible();await expect(page.locator('.result-summary')).toContainText('3 / 3');await page.reload();await expect(page.locator('.result-summary')).toContainText('3 / 3');
 await page.getByRole('checkbox',{name:'Afficher seulement les étapes à revoir'}).check();await expect(page.getByText('Toutes les réponses sont entièrement correctes.')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.goto('/#/cas-cliniques');await expect(page.getByRole('heading',{name:'Dossiers terminés'})).toBeVisible();await expect(page.locator('.session-line')).toContainText('3 / 3');
});
test('filtre, dossier transversal et poursuite hors ligne',async({page,context})=>{
 await page.goto('/#/cas-cliniques');await page.getByLabel('Spécialité du dossier').selectOption('cardiologie');await expect(page.getByRole('button',{name:/^Commencer /})).toHaveCount(3);await page.getByRole('button',{name:'Commencer Ramipril, interactions et surveillance'}).click();
 await page.getByRole('radio',{name:'Ramiprilate',exact:true}).check();await page.getByRole('button',{name:'Valider l’étape et corriger'}).click();await expect(page.getByRole('status')).toHaveText('Réponse verrouillée et enregistrée');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await expect(page.getByRole('button',{name:'Découvrir l’étape suivante'})).toBeVisible();await context.setOffline(true);await page.reload();
 await page.getByRole('button',{name:'Découvrir l’étape suivante'}).click();await expect(page.getByRole('heading',{name:'Examiner une association hypothétique'})).toBeVisible();
 await page.getByRole('radio',{name:'Risque accru d’hypotension, d’hyperkaliémie et d’altération rénale.'}).check();await page.getByRole('button',{name:'Valider l’étape et corriger'}).click();await expect(page.getByRole('heading',{name:/Réponse entièrement correcte/})).toBeVisible();
});
test('adresse absente gérée sans erreur de navigation',async({page})=>{await page.goto('/#/dossiers/inconnu');await expect(page.getByRole('heading',{name:'Dossier indisponible'})).toBeVisible();await page.getByRole('link',{name:'Retour aux cas cliniques'}).click();await expect(page.getByRole('heading',{name:'Cas cliniques',exact:true})).toBeVisible();});
