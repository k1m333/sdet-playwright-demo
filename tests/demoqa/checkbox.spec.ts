import { expect, test } from '../../fixtures/test-fixtures';
import { CheckBoxPage } from '../../pages/CheckBoxPage';

test('expands tree and select a checkbox', async ({ page }) => {
    const checkBoxPage = new CheckBoxPage(page);
    await checkBoxPage.goto();
    await checkBoxPage.expandAll();
    await checkBoxPage.selectFirstCheckbox();
    await checkBoxPage.expectFirstCheckboxChecked();
});

test('Expand all → select first checkbox → result panel shows a value', async ({ page }) => {
  const checkBoxPage = new CheckBoxPage(page);

  await checkBoxPage.goto();
  await checkBoxPage.expandAll();
  await checkBoxPage.selectFirstCheckbox();

  const results = await checkBoxPage.getSelectedResults();
  expect(results.length).toBeGreaterThan(0);
});

test('Expand Home, check Downloads, and assert result reflects selection', async ({ page }) => {
  const checkBoxPage = new CheckBoxPage(page);
  await test.step("Navigate", async () => {
    await checkBoxPage.goto();
  });
  await test.step("Expand and select Downloads", async () => {
    await checkBoxPage.expandAll();
    await page.locator('label[for="tree-node-downloads"] .rct-checkbox').click();
  });
  await test.step("Assert Downloads show in results panel", async () => {
      await expect(page.locator('#result')).toContainText('downloads');
  });
});


test('checkbox: expanding tree with no selection no results', async ({ page }) => {
  const checkBoxPage = new CheckBoxPage(page);
  await checkBoxPage.goto();
  await checkBoxPage.expandAll();
  await expect(checkBoxPage.getResultsPanel()).not.toBeVisible();
});

test('Persistence: selected checkbox clears on reload', async ({ page }) => {
  const checkBoxPage = new CheckBoxPage(page);

  await checkBoxPage.goto();
  await checkBoxPage.expandAll();

  await test.step('select Word File document', async () => {
    await page.getByText('Word File.doc').click();
    await expect(page.locator('#result')).toContainText('wordFile');
  });

  await test.step('reload page and verify selection persistence', async () => {
    await page.reload();
    await expect(page.locator('#result')).not.toBeVisible();
  });
});

test('Select checkbox, collapse tree, and results persist', async ({ page }) => {
  const checkBoxPage = new CheckBoxPage(page);
  await checkBoxPage.goto();
  await checkBoxPage.expandAll();
    await test.step("Expand and select Downloads", async () => {
    await checkBoxPage.expandAll();
    await page.locator('label[for="tree-node-downloads"] .rct-checkbox').click();
  });
  await expect(checkBoxPage.results).toContainText(/downloads/i);
  await checkBoxPage.collapseAll();
  await test.step('Verify selection still appears in results', async () => {
      await expect(checkBoxPage.results).toContainText(/downloads/i);
  });
});

