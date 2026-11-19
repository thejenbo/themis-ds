import type { ProfilerOnRenderCallback } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { cleanup, renderApp, wait } from './test-utils';

afterEach(cleanup);

/** Opens the brand colour's picker and focuses its hue slider. */
async function focusBrandHue() {
  await page.getByRole('button', { name: /Pick the brand color/ }).click();
  const hue = page.getByRole('slider').nth(1);
  await expect.element(hue).toBeVisible();
  (hue.element() as HTMLElement).focus();
  return hue;
}

describe('colour fields', () => {
  test('each picker button says which colour it is for', async () => {
    renderApp();
    for (const name of ['brand', 'text', 'background', 'error', 'warning', 'success']) {
      await expect.element(page.getByRole('button', { name: new RegExp(`Pick the ${name} color`) })).toBeInTheDocument();
    }
  });

  test('typing a colour updates the theme and its contrast badges', async () => {
    renderApp();
    const brand = page.getByRole('textbox', { name: /Brand/ });
    await brand.fill('#FFFF00');
    await userEvent.keyboard('{Tab}');
    // The badge is part of the field's name. Yellow on white fails.
    await expect.element(page.getByRole('textbox', { name: /^Brand/ })).toHaveAccessibleName('Brand Fail');
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
    // `base` is what rendering the whole tree would cost. Each step should render the stepped colour field, the
    // theme row and the preview's theme variables — not the other five fields, the selects or the simulator.
    // Measured: about 0.09 with the memoisation; 0.25 without the memoised colour rows, 0.28 without the memoised
    // simulator (that was the keyboard lag).
    expect(updates.length).toBeGreaterThan(0);
    expect(actual / base).toBeLessThan(0.17);
  });
});
