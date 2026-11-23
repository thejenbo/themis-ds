import type { ProfilerOnRenderCallback } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { chooseMenuItem, cleanup, nameField, renderApp, themeSelect, wait } from './test-utils';

afterEach(cleanup);

/** Opens the brand color's picker and focuses its hue slider. */
async function focusBrandHue() {
  await page.getByRole('button', { name: /Pick the brand color/ }).click();
  const hue = page.getByRole('slider').nth(1);
  await expect.element(hue).toBeVisible();
  (hue.element() as HTMLElement).focus();
  return hue;
}

describe('color fields', () => {
  test('each picker button says which color it is for', async () => {
    renderApp();
    for (const name of ['brand', 'text', 'background', 'error', 'warning', 'success']) {
      await expect.element(page.getByRole('button', { name: new RegExp(`Pick the ${name} color`) })).toBeInTheDocument();
    }
  });

  test('typing a color updates the theme and its contrast badges', async () => {
    renderApp();
    const brand = page.getByRole('textbox', { name: /Brand/ });
    await brand.fill('#FFFF00');
    await userEvent.keyboard('{Tab}');
    // Yellow on white fails. The rating is a button beside the label (not part of the field's name).
    await expect.element(page.getByRole('button', { name: /^Brand contrast: Fail/ })).toBeVisible();
    await expect.element(page.getByRole('textbox', { name: /^Brand/ })).toHaveAccessibleName('Brand');
  });

  test('the hue slider steps exactly one degree per arrow key (no hex rounding)', async () => {
    renderApp();
    const hue = await focusBrandHue();
    const start = parseFloat(hue.element().getAttribute('aria-valuetext')!);
    const steps: number[] = [];
    for (let i = 0; i < 8; i++) {
      await userEvent.keyboard('{ArrowRight}');
      steps.push(parseFloat(hue.element().getAttribute('aria-valuetext')!));
    }
    // Before the fix, the value went through hex on every step and landed on 270.13°, 270.92°, 271.97°…
    expect(steps.every(Number.isInteger)).toBe(true);
    expect(steps[7]! - steps[0]!).toBe(7);
    expect(steps[0]).toBeGreaterThan(start);
  });

  test('a slider step re-renders only a small part of the app (the lag fix)', async () => {
    const commits: { phase: string; actual: number; base: number }[] = [];
    const onRender: ProfilerOnRenderCallback = (_id, phase, actual, base) => commits.push({ phase, actual, base });
    renderApp({ onRender });
    await focusBrandHue();
    await wait(300);
    commits.length = 0;
    for (let i = 0; i < 10; i++) await userEvent.keyboard('{ArrowRight}');
    await wait(300);
    const updates = commits.filter((c) => c.phase === 'update');
    const actual = updates.reduce((sum, c) => sum + c.actual, 0);
    const base = updates.reduce((sum, c) => sum + c.base, 0);
    // `base` is what rendering the whole tree would cost. Each step should render the stepped color field, the
    // theme row and the preview's theme variables — not the other five fields, the selects or the simulator.
    // Measured: about 0.09 with the memoisation; 0.25 without the memoised color rows, 0.28 without the memoised
    // simulator (that was the keyboard lag).
    expect(updates.length).toBeGreaterThan(0);
    expect(actual / base).toBeLessThan(0.17);
  });
});

const field = (name: string) => page.getByRole('textbox', { name: new RegExp(`^${name}`) });
/** The color code typed in a field, as shown. */
const code = (name: string) => (field(name).element() as HTMLInputElement).value;
const formatButton = (name: string) => page.getByRole('button', { name: new RegExp(`^${name}.*format`) });
const codeControl = () => page.getByRole('radiogroup', { name: 'Color code for every field' });

describe('color code control (HEX, RGB, HSL, HSB)', () => {
  test('choosing a code switches every field; one field can then differ', async () => {
    renderApp();
    await expect.element(codeControl().getByRole('radio', { name: 'HEX' })).toBeChecked();
    await codeControl().getByRole('radio', { name: 'RGB' }).click();
    for (const name of ['Brand', 'Text', 'Background', 'Error', 'Warning', 'Success']) {
      await expect.poll(() => code(name)).toMatch(/^\d+, \d+, \d+$/);
    }
    // Switch one field back on its own: the control then shows no shared code.
    await formatButton('Text').click();
    await page.getByRole('option', { name: 'HEX' }).click();
    await expect.element(field('Text')).toHaveValue('#000000');
    await expect.poll(() => code('Brand')).toMatch(/^\d+, \d+, \d+$/);
    await expect.poll(() => codeControl().getByRole('radio', { checked: true }).query()).toBeNull();
    // Choosing any code applies it to all six again, including the one that differed.
    await codeControl().getByRole('radio', { name: 'HSL' }).click();
    await expect.poll(() => code('Text')).toMatch(/^\d+, \d+%, \d+%$/);
    await expect.poll(() => code('Brand')).toMatch(/^\d+, \d+%, \d+%$/);
  });

  test('each theme’s codes are remembered in the browser', async () => {
    renderApp();
    await codeControl().getByRole('radio', { name: 'HSB' }).click();
    await expect.poll(() => code('Brand')).toMatch(/^\d+, \d+%, \d+%$/);
    // Another theme keeps its own codes.
    await themeSelect().click();
    await page.getByRole('option', { name: 'dark' }).click();
    await expect.poll(() => code('Brand')).toMatch(/^#/);
    await themeSelect().click();
    await page.getByRole('option', { name: 'light' }).click();
    await expect.poll(() => code('Brand')).toMatch(/^\d+, \d+%, \d+%$/);
    // And they come back on the next visit.
    await wait(500);
    renderApp({ keepStorage: true });
    await expect.poll(() => code('Brand')).toMatch(/^\d+, \d+%, \d+%$/);
    await expect.element(codeControl().getByRole('radio', { name: 'HSB' })).toBeChecked();
  });

  test('renaming or duplicating a theme keeps its codes', async () => {
    renderApp();
    await codeControl().getByRole('radio', { name: 'RGB' }).click();
    await chooseMenuItem('Duplicate "light"');
    await expect.poll(() => code('Brand')).toMatch(/^\d+, \d+, \d+$/);
    await userEvent.keyboard('{Enter}');
    await expect.element(themeSelect()).toHaveTextContent('light copy');
    await expect.poll(() => code('Brand')).toMatch(/^\d+, \d+, \d+$/);
    await chooseMenuItem('Rename "light copy"');
    await nameField().fill('lilac');
    await userEvent.keyboard('{Enter}');
    await expect.element(themeSelect()).toHaveTextContent('lilac');
    await expect.poll(() => code('Brand')).toMatch(/^\d+, \d+, \d+$/);
    await wait(500);
    expect(Object.keys(JSON.parse(localStorage.getItem('themis-config:color-formats')!))).toEqual(['light', 'lilac']);
  });
});
