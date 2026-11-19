import { afterEach, describe, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { initialConfig } from './initial-config';
import { chooseMenuItem, cleanup, preview, renderApp, sidebar, wait } from './test-utils';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const rect = (el: Element) => el.getBoundingClientRect();
/** Within a pixel: layout positions can land on half pixels. */
const near = (a: number, b: number) => Math.abs(a - b) <= 1;

describe('header', () => {
  test('the current page is marked and underlined; the underline slides to the other link', async () => {
    renderApp();
    const simulator = page.getByRole('link', { name: 'simulator' });
    const docs = page.getByRole('link', { name: 'docs' });
    await expect.element(simulator).toHaveAttribute('aria-current', 'page');
    const indicator = () => document.querySelector('nav span[aria-hidden]')!;
    await expect.poll(() => near(rect(indicator()).left, rect(simulator.element()).left)).toBe(true);

    await docs.click();
    await expect.element(docs).toHaveAttribute('aria-current', 'page');
    // It animates (like the Tabs indicator) rather than jumping.
    expect(getComputedStyle(indicator()).transitionProperty).toContain('translate');
    await expect.poll(() => near(rect(indicator()).left, rect(docs.element()).left)).toBe(true);
    await expect.poll(() => near(rect(indicator()).width, rect(docs.element()).width)).toBe(true);
    await expect.element(page.getByText('The docs view is coming soon.')).toBeVisible();
  });
});

describe('sidebar', () => {
  test('section headings use the small heading size (Figma type/heading/sm)', async () => {
    renderApp();
    const colors = page.getByRole('heading', { name: 'Colors' });
    await expect.element(colors).toBeVisible();
    const size = parseFloat(getComputedStyle(colors.element()).fontSize);
    // type/heading/sm: 16px, or 18px on wider screens (it was md, a step too big).
    expect([16, 18]).toContain(size);
  });

  test('the theme row stays at the top while the sidebar scrolls', async () => {
    renderApp();
    const aside = await sidebar();
    const row = aside.firstElementChild!;
    expect(getComputedStyle(row).position).toBe('sticky');
    aside.scrollTop = 400;
    await wait(50);
    expect(aside.scrollTop).toBeGreaterThan(0);
    expect(near(rect(row).top, rect(aside).top)).toBe(true);
  });

  test('the ✓ and ✕ buttons keep their 40px size next to the name field', async () => {
    renderApp();
    await chooseMenuItem('Add new theme');
    for (const name of ['Create theme', 'Cancel']) {
      const button = page.getByRole('button', { name, exact: true }).element();
      expect(Math.round(rect(button).width)).toBe(40);
    }
    // And nothing spills past the sidebar's padding.
    const cancel = rect(page.getByRole('button', { name: 'Cancel', exact: true }).element());
    const side = rect(await sidebar());
    expect(cancel.right).toBeLessThanOrEqual(side.right - 24 + 0.5);
  });
});

describe('border modes', () => {
  test('the tool’s own UI uses the "themis config" radius and width; the preview keeps the theme’s', async () => {
    // A saved theme that leaves width and radius out (as a hand-written theme file may).
    const plain = { colors: initialConfig.themes.light!.colors };
    renderApp({ saved: { config: { version: 1, themes: { plain } }, selected: 'plain' } });
    const exportButton = page.getByRole('button', { name: 'Export' });
    await expect.element(exportButton).toBeVisible();
    // themis config: radius md 4px, width sm 1px (the sidebar's edge).
    expect(getComputedStyle(exportButton.element()).borderTopLeftRadius).toBe('4px');
    expect(getComputedStyle(await sidebar()).borderInlineStartWidth).toBe('1px');
    // The preview's theme doesn't set them, so it gets medium (radius md 10px), not the tool's modes.
    const save = page.getByRole('main').getByRole('button', { name: 'Save Changes' });
    await expect.element(save).toBeVisible();
    expect(getComputedStyle(save.element()).borderTopLeftRadius).toBe('10px');
  });

  test('"themis config" isn’t offered as a width or radius for a theme', async () => {
    renderApp();
    for (const label of ['Width', 'Radius']) {
      await page.getByRole('complementary').getByRole('button', { name: new RegExp(label) }).click();
      await expect.poll(() => page.getByRole('option').elements().map((o) => o.textContent)).toHaveLength(4);
      expect(page.getByRole('option', { name: /themis config/i }).query()).toBeNull();
      await userEvent.keyboard('{Escape}');
    }
  });
});

describe('simulator', () => {
  test('the page has a 7% brand tint behind it', async () => {
    renderApp();
    const surface = (await preview()).firstElementChild!;
    // Light theme: 7% of #7406EB over white.
    await expect.poll(() => getComputedStyle(surface).backgroundColor).toMatch(/color\(srgb 0\.96\d* 0\.93\d* 0\.99\d*\)|rgb\(245, 237, 254\)/);
  });

  test('the title has a 1px outline in the background colour, painted under the letters', async () => {
    renderApp();
    const title = page.getByRole('heading', { name: 'Settings Sim', level: 1 });
    await expect.element(title).toBeVisible();
    const style = getComputedStyle(title.element());
    expect(style.webkitTextStrokeWidth).toBe('2px');
    expect(style.webkitTextStrokeColor).toBe('rgb(255, 255, 255)');
    expect(style.paintOrder).toMatch(/^stroke/);
  });
});

describe('export', () => {
  test('shows the theme file, copies it with a toast, and downloads themis.theme.json', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue({ writeText } as unknown as Clipboard);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    renderApp();
    await page.getByRole('button', { name: 'Export' }).click();
    const dialog = page.getByRole('dialog', { name: 'Export theme file' });
    await expect.element(dialog).toBeVisible();
    const json = JSON.parse(document.querySelector('pre')!.textContent!);
    expect(Object.keys(json.themes)).toEqual(['light', 'dark']);

    await dialog.getByRole('button', { name: 'Copy' }).click();
    expect(JSON.parse(writeText.mock.calls[0]![0])).toEqual(json);
    // Screen readers hear "Success: Theme file copied."
    await expect.element(page.getByText(/Theme file copied\./)).toBeVisible();

    await dialog.getByRole('button', { name: 'Download' }).click();
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('themis.theme.json');
  });
});
