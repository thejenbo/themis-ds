import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { ScalesIllustration } from './illustrations/ScalesIllustration';
import { cleanup, preview, renderApp } from './test-utils';

afterEach(cleanup);

const scales = () => document.querySelector('[data-sim-part="scales"] svg')!;

describe('scales illustration', () => {
  test('tips like the logomark while a colour fails contrast: the arms turn and the pans move with them', async () => {
    renderApp();
    await preview();
    const arms = () => scales().querySelector('[data-part="arms"]')!;
    await expect.poll(() => arms()).toBeTruthy();
    expect(getComputedStyle(arms()).transform).toBe('none');
    await page.getByRole('textbox', { name: /^Warning/ }).fill('#E89A2C');
    await userEvent.keyboard('{Tab}');
    await expect.poll(() => getComputedStyle(arms()).transform).not.toBe('none');
    const pan = scales().querySelector('[data-part="pan"]') as SVGGElement;
    expect(pan.style.transform).toMatch(/^translate/);
  });

  test('its stars, and the heading’s, twinkle when the theme changes', async () => {
    renderApp();
    await preview();
    const twinkling = () =>
      [...document.querySelectorAll('[data-part="star"]')].filter((s) => s.getAnimations().some((a) => a.id === 'twinkle')).length;
    await expect.poll(() => document.querySelectorAll('[data-part="star"]').length).toBe(4);
    expect(twinkling()).toBe(0);
    await page.getByRole('textbox', { name: /^Brand/ }).fill('#0B7A75');
    await userEvent.keyboard('{Tab}');
    await expect.poll(twinkling).toBe(4);
  });

  test('rocking (the components loading screen): the scales tip back and forth and the stars twinkle, over and over', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    root.render(<ScalesIllustration motion="rocking" width={240} />);
    try {
      await expect.poll(() => host.querySelector('[data-part="arms"]')).toBeTruthy();
      const arms = getComputedStyle(host.querySelector('[data-part="arms"]')!);
      expect(arms.animationName).not.toBe('none');
      expect(arms.animationIterationCount).toBe('infinite');
      expect(arms.animationDirection).toBe('alternate');
      for (const pan of host.querySelectorAll('[data-part="pan"]')) expect(getComputedStyle(pan).animationName).not.toBe('none');
      for (const star of host.querySelectorAll('[data-part="star"]')) expect(getComputedStyle(star).animationIterationCount).toBe('infinite');
    } finally {
      root.unmount();
      host.remove();
    }
  });
});
