import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { cleanup, renderApp } from './test-utils';

afterEach(cleanup);

const dialog = () => page.getByRole('dialog', { name: 'Contrast ratings' });

async function setColor(name: string, code: string) {
  await page.getByRole('textbox', { name: new RegExp(`^${name}`) }).fill(code);
  await userEvent.keyboard('{Tab}');
}

describe('contrast ratings', () => {
  test('a rating chip sums up the lowest contrast on hover, and opens the details on that colour', async () => {
    renderApp();
    const chip = page.getByRole('button', { name: /^Brand contrast: AA, lowest 6\.23 to 1/ });
    // React Aria only treats hover as intentional once the pointer has moved on the page.
    await page.getByRole('heading', { name: 'Colors' }).hover();
    await chip.hover();
    await expect.element(page.getByRole('tooltip')).toHaveTextContent('Lowest 6.23:1: brand text on a brand highlight. Select for details.');
    // Its arrow points at the info icon, not the middle of the chip.
    const centre = (el: Element) => {
      const r = el.getBoundingClientRect();
      return (r.left + r.right) / 2;
    };
    const arrow = page.getByRole('tooltip').element().querySelector('svg')!;
    const icon = [...chip.element().querySelectorAll('svg')].at(-1)!;
    await expect.poll(() => Math.abs(centre(arrow) - centre(icon))).toBeLessThan(1);
    await chip.click();
    await expect.element(dialog()).toBeVisible();
    await expect.element(dialog().getByRole('tab', { name: 'Brand (AA)' })).toHaveAttribute('aria-selected', 'true');
    // Every place brand is checked, the lowest first.
    const rows = dialog().getByRole('list', { name: 'Where brand is checked' }).getByRole('listitem');
    expect(rows.elements()).toHaveLength(4);
    expect(rows.first().element().textContent).toMatch(/^LowestBrand text on a brand highlight/);
    // Tokens only when asked for.
    expect(dialog().getByText('text-inverse').query()).toBeNull();
    await dialog().getByText('Show tokens').click();
    await expect.element(dialog().getByText('text-inverse', { exact: true }).first()).toBeVisible();
  });

  test('a failing colour gets a suggested fix, written in its field’s colour code, that brings it to AA', async () => {
    renderApp();
    await page.getByRole('radio', { name: 'RGB' }).click();
    await setColor('Warning', '232, 154, 44');
    const chip = page.getByRole('button', { name: /^Warning contrast: Fail/ });
    await expect.element(chip).toBeVisible();
    await chip.click();
    const use = dialog().getByRole('button', { name: /^Use RGB \d+, \d+, \d+$/ });
    await expect.element(use).toBeVisible();
    const code = use.element().textContent!.replace('Use RGB ', '');
    await use.click();
    await expect.element(page.getByRole('textbox', { name: /^Warning/ })).toHaveValue(code);
    await expect.element(page.getByRole('button', { name: /^Warning contrast: AA/ })).toBeVisible();
    // Fixed, the suggestion goes away.
    expect(dialog().getByRole('group', { name: 'Suggested fix' }).query()).toBeNull();
  });

  test('“About contrast ratings” opens the explanation; disabled text is shown but not rated', async () => {
    renderApp();
    await page.getByRole('button', { name: 'About contrast ratings' }).click();
    await expect.element(dialog().getByRole('tab', { name: 'About' })).toHaveAttribute('aria-selected', 'true');
    await expect.element(dialog().getByRole('heading', { name: 'What the ratings mean' })).toBeVisible();
    await dialog().getByRole('tab', { name: /^Background/ }).click();
    await expect.element(dialog().getByText('Not rated')).toBeVisible();
  });

  test('the tipped scales open the details on the first failing colour', async () => {
    renderApp();
    expect(page.getByRole('button', { name: /fails contrast/ }).query()).toBeNull();
    await setColor('Error', '#FF8080');
    await page.getByRole('button', { name: 'A colour fails contrast. Review it' }).click();
    await expect.element(dialog().getByRole('tab', { name: 'Error (Fail)' })).toHaveAttribute('aria-selected', 'true');
  });

  test('on a phone, a select picks the colour instead of tabs', async () => {
    await page.viewport(402, 874);
    try {
      renderApp();
      await page.getByRole('button', { name: /^Text contrast/ }).click();
      await expect.element(dialog()).toBeVisible();
      expect(dialog().getByRole('tablist').query()).toBeNull();
      await dialog().getByRole('button', { name: /Show/ }).click();
      await page.getByRole('option', { name: /^About/ }).click();
      await expect.element(dialog().getByRole('heading', { name: 'What the ratings mean' })).toBeVisible();
    } finally {
      await page.viewport(1440, 1000);
    }
  });
});
