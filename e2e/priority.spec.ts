import {test, expect} from '@playwright/test';
test('référence historique clairement visible avec source, sans attribuer un retrait à toute la molécule', async ({page}) => {
  await page.goto('/#/medicaments/sertraline');
  const notice = page.getByRole('region', {name: 'Réserve sur la spécialité de référence'});
  await expect(notice).toContainText('30 septembre 2024');
  await expect(notice).toContainText('ne signifie pas que toutes les spécialités');
  await notice.getByText('Source et vérification', {exact: true}).click();
  await expect(notice.getByRole('link')).toHaveAttribute('href', 'https://base-donnees-publique.medicaments.gouv.fr/medicament/63288007/extrait');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('nouvelles rubriques accessibles, avec restrictions de population et demi-vie encore absente', async ({page}) => {
  await page.goto('/#/medicaments/spironolactone');
  await page.getByText('Sécurité', {exact: true}).click();
  await expect(page.getByText('Contre-indication rénale sévère/aiguë ; chez l’enfant, également modérée. La créatininémie isolée peut être faussement rassurante.', {exact: true})).toBeVisible();
  await page.getByText('Pharmacocinétique', {exact: true}).click();
  const halfLife = page.locator('.field-row').filter({has: page.getByText('Demi-vie', {exact: true})});
  await expect(halfLife).toContainText('À documenter');
  await expect(page.getByText(/Ces durées ne sont pas une demi-vie plasmatique/)).toBeVisible();
  await page.goto('/#/medicaments/ibuprofene');
  await page.getByText('Indications et stratégie', {exact: true}).click();
  await expect(page.getByText(/adultes et adolescents d’au moins 12 ans et 40 kg/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
