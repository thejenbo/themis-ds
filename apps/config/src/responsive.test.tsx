import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { renderApp } from './test-utils';

const rect = (el: Element) => el.getBoundingClientRect();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The other config tests run at 1440 × 1000 (desktop); put that back after each one here.
afterEach(async () => {
  await page.viewport(1440, 1000);
});

describe('mobile (under 48em, Figma 2443:14356)', () => {
  // It ends on the components page, which loads every story: that can take most of the default 15s in a full run.
  test('the header has the 16px wordmark and the page links in a menu behind a hamburger button', { timeout: 45000 }, async () => {
    await page.viewport(402, 874);
    renderApp();
    const wordmark = page.getByText('Themis Config', { exact: true });
    await expect.element(wordmark).toBeVisible();
    expect(getComputedStyle(wordmark.element()).fontSize).toBe('16px');
    expect(page.getByRole('navigation', { name: 'Pages' }).query()).toBeNull();
    await page.getByRole('button', { name: 'Pages' }).click();
    const items = page.getByRole('menuitem');
    await expect.element(items.first()).toBeVisible();
    expect(items.elements().map((el) => el.textContent)).toEqual(['simulator (current page)', 'components', 'docs(opens in a new tab)']);
    // Links in an ActionMenu aren't underlined (they were, as plain links).
    for (const el of items.elements()) expect(getComputedStyle(el).textDecorationLine).toBe('none');
    // The current page is underlined, as in the full header; the others aren't.
    // The page name sits in the item's label wrapper.
    const underline = (name: string) => {
      const label = page.getByRole('menuitem', { name, exact: true }).element().firstElementChild!.firstElementChild!;
      expect(label.textContent).toBe(name.replace(' (current page)', ''));
      return getComputedStyle(label).textDecorationLine;
    };
    expect(underline('simulator (current page)')).toBe('underline');
    expect(underline('components')).toBe('none');
    await page.getByRole('menuitem', { name: 'components' }).click();
    await expect.poll(() => location.hash).toBe('#components');
    await page.getByRole('radio', { name: 'Preview' }).click();
    await expect.element(page.getByRole('searchbox', { name: 'Find a component' })).toBeVisible();
  });

  test('Settings and Preview take turns above Export, which stays at the bottom of the window', async () => {
    await page.viewport(402, 874);
    renderApp();
    const settings = page.getByRole('complementary', { name: 'Theme settings' });
    const preview = page.getByRole('main');
    const exportButton = page.getByRole('button', { name: 'Export' });
    // Settings first: the sections, and no preview.
    await expect.element(settings).toBeVisible();
    expect(preview.query()).toBeNull();
    await expect.element(page.getByRole('radio', { name: 'Settings' })).toBeChecked();
    expect(Math.round(rect(exportButton.element()).bottom)).toBe(874 - 16);

    await page.getByRole('radio', { name: 'Preview' }).click();
    await expect.element(preview).toBeVisible();
    expect(settings.query()).toBeNull();
    // The preview sits where the sections were: under the theme row and the switch, above Export.
    const switcher = page.getByRole('radiogroup', { name: 'Show' }).element();
    expect(rect(preview.element()).top).toBeGreaterThan(rect(switcher).bottom);
    // Export stays pinned to the bottom while the preview scrolls under it.
    const column = preview.element().parentElement!;
    column.scrollTop = 400;
    await wait(50);
    expect(column.scrollTop).toBeGreaterThan(0);
    expect(Math.round(rect(exportButton.element()).bottom)).toBe(874 - 16);
  });

  // Buttons used to drop onto a line of their own under the text beside them.
  test('in the preview, buttons stay beside their text, which wraps; "Delete Forever" shortens to "Delete"', async () => {
    await page.viewport(375, 812);
    renderApp();
    await page.getByRole('radio', { name: 'Preview' }).click();
    // Vertically overlapping: on the same line, not stacked.
    const beside = (a: Element, b: Element) => rect(a).top < rect(b).bottom && rect(b).top < rect(a).bottom;

    const deleteButton = page.getByRole('button', { name: 'Delete Forever' });
    await expect.element(deleteButton).toBeVisible();
    expect(deleteButton.element().textContent).toBe('DeleteForever');
    expect((deleteButton.element() as HTMLElement).innerText.trim()).toBe('Delete');
    expect(beside(deleteButton.element(), page.getByText('Delete Account', { exact: true }).element())).toBe(true);
    expect(beside(page.getByRole('button', { name: 'Update', exact: true }).element(), page.getByText('Email', { exact: true }).element())).toBe(true);

    await page.getByRole('tab', { name: 'subscription' }).click();
    const cardUpdate = page.getByRole('button', { name: 'Update', exact: true });
    await expect.element(cardUpdate).toBeVisible();
    expect(beside(cardUpdate.element(), page.getByText('4242', { exact: true }).element())).toBe(true);
  });

  // A visually hidden Table column label was placed against the page instead of the table, widening the page.
  test('the components page doesn’t scroll sideways', { timeout: 45000 }, async () => {
    await page.viewport(375, 812);
    renderApp();
    await page.getByRole('button', { name: 'Pages' }).click();
    await page.getByRole('menuitem', { name: 'components' }).click();
    await page.getByRole('radio', { name: 'Preview' }).click();
    await expect.poll(() => document.querySelectorAll('[data-component-stage]').length, { timeout: 15000 }).toBeGreaterThan(30);
    const preview = page.getByRole('main').element();
    const column = preview.parentElement!;
    expect(column.scrollWidth).toBeLessThanOrEqual(column.clientWidth);
    expect(preview.scrollWidth).toBeLessThanOrEqual(preview.clientWidth);
    // The cause: anything absolutely placed inside a table must be placed within the table's (scrolling) frame, or
    // it can sit past the edge of the page.
    const escaped = [...preview.querySelectorAll('table *')].filter((el) => {
      if (getComputedStyle(el).position !== 'absolute') return false;
      const frame = el.closest('table')!.parentElement!;
      const placedBy = (el as HTMLElement).offsetParent;
      return !placedBy || !frame.contains(placedBy);
    });
    expect(escaped.map((el) => el.textContent)).toEqual([]);
  });
});

describe('tablet (48em to 64em)', () => {
  test('the preview sits on top, with the settings under it and Export beside the theme', async () => {
    await page.viewport(834, 1112);
    renderApp();
    await expect.element(page.getByRole('main')).toBeVisible();
    const preview = page.getByRole('main').element();
    const settings = page.getByRole('complementary', { name: 'Theme settings' }).element();
    expect(Math.round(rect(settings).top)).toBeGreaterThanOrEqual(Math.round(rect(preview).bottom));
    expect(Math.round(rect(preview).width)).toBe(834);
    // Export at the end of the theme row, level with the select's box.
    const exportButton = page.getByRole('button', { name: 'Export' }).element();
    const actions = page.getByRole('button', { name: /^Actions for the/ }).element();
    expect(Math.round(rect(exportButton).top)).toBe(Math.round(rect(actions).top));
    expect(rect(exportButton).left).toBeGreaterThan(rect(actions).right);
  });

  test('Colors, Borders and Fonts are equal-width tabs that say what’s set, with the fields in two columns', async () => {
    await page.viewport(834, 1112);
    renderApp();
    await expect.element(page.getByRole('tab', { name: 'Colors' })).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByRole('tab', { name: 'Borders Medium width • Medium radius' })).toBeVisible();
    await expect.element(page.getByRole('tab', { name: 'Fonts Playfair Display • Montserrat' })).toBeVisible();
    const widths = page.getByRole('tablist', { name: 'Theme settings' }).getByRole('tab').elements().map((t) => Math.round(rect(t).width));
    expect(new Set(widths).size).toBe(1);
    const label = (name: string) => [...document.querySelectorAll('label')].find((l) => l.textContent?.startsWith(name))!;
    // The color code control at the start of the row, above the fields.
    const control = page.getByRole('radiogroup', { name: 'Color code for every field' }).element();
    expect(Math.round(rect(control).left)).toBe(Math.round(rect(label('Brand')).left));
    // Brand, Text and Background down the left; Error, Warning and Success down the right.
    const left = ['Brand', 'Text', 'Background'].map((n) => rect(label(n)));
    const right = ['Error', 'Warning', 'Success'].map((n) => rect(label(n)));
    expect(new Set(left.map((r) => Math.round(r.left))).size).toBe(1);
    expect(new Set(right.map((r) => Math.round(r.left))).size).toBe(1);
    expect(right[0]!.left).toBeGreaterThan(left[0]!.right);
    left.forEach((r, i) => {
      expect(Math.round(r.top)).toBe(Math.round(right[i]!.top));
      if (i > 0) expect(r.top).toBeGreaterThan(left[i - 1]!.top);
    });
    // A failing color shows on the Colors tab.
    await page.getByRole('textbox', { name: /^Brand/ }).fill('#FFFF00');
    await userEvent.keyboard('{Tab}');
    await page.getByRole('tab', { name: /^Borders/ }).click();
    await expect.element(page.getByRole('tab', { name: 'Colors Fail' })).toBeVisible();
    // Borders' two fields side by side too.
    const width = page.getByText('Width', { exact: true });
    await expect.element(width).toBeVisible();
    const radius = page.getByText('Radius', { exact: true }).element();
    expect(Math.round(rect(width.element()).top)).toBe(Math.round(rect(radius).top));
    expect(rect(radius).left).toBeGreaterThan(rect(width.element()).right);
  });

  test('the settings drawer drags up and down, or moves with the arrow keys', async () => {
    await page.viewport(834, 1112);
    renderApp();
    const handle = page.getByRole('separator', { name: 'Resize the preview' });
    await expect.element(handle).toHaveAttribute('aria-valuenow', '40');
    const preview = () => rect(page.getByRole('main').element());
    const before = preview().height;
    // Drag it 200px up from where it's grabbed: the preview shrinks by as much, without a jump.
    const el = handle.element() as HTMLElement;
    const start = rect(el);
    const y = start.top + start.height / 2;
    const fire = (type: string, clientY: number) =>
      el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 1, button: 0, clientY, clientX: 400, isPrimary: true }));
    el.setPointerCapture = () => {};
    el.hasPointerCapture = () => true;
    fire('pointerdown', y);
    fire('pointermove', y - 200);
    await wait(50);
    expect(Math.round(before - preview().height)).toBe(200);
    // It stops at 15%, so there's always some preview to see.
    fire('pointermove', 0);
    await expect.element(handle).toHaveAttribute('aria-valuenow', '15');
    // Keyboard: arrows move it 5% of the height, End takes it as low as it goes.
    el.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(handle).toHaveAttribute('aria-valuenow', '20');
    await userEvent.keyboard('{End}');
    await expect.element(handle).toHaveAttribute('aria-valuenow', '85');
    expect(el.getAttribute('aria-controls')).toBe(page.getByRole('main').element().id);
  });

  test('the drawer stays where it was left, after a reload', async () => {
    await page.viewport(834, 1112);
    renderApp();
    const handle = page.getByRole('separator', { name: 'Resize the preview' });
    await expect.element(handle).toHaveAttribute('aria-valuenow', '40');
    (handle.element() as HTMLElement).focus();
    await userEvent.keyboard('{PageDown}');
    await expect.element(handle).toHaveAttribute('aria-valuenow', '60');
    renderApp({ keepStorage: true });
    await expect.element(page.getByRole('separator', { name: 'Resize the preview' })).toHaveAttribute('aria-valuenow', '60');
    // A stored value out of range is brought back within the limits.
    localStorage.setItem('themis-config:preview-share', '2');
    renderApp({ keepStorage: true });
    await expect.element(page.getByRole('separator', { name: 'Resize the preview' })).toHaveAttribute('aria-valuenow', '85');
  });
});

describe('changing layout', () => {
  test('the current page keeps its underline after the window has been phone-width (it shrank to nothing)', async () => {
    renderApp();
    await page.getByRole('link', { name: 'components' }).click();
    const underline = () => document.querySelector<HTMLElement>('nav[aria-label="Pages"] > span[aria-hidden]');
    const link = () => document.querySelector('nav[aria-label="Pages"] a[aria-current="page"]')!;
    await expect.poll(() => underline()?.offsetWidth).toBe(Math.round(link().getBoundingClientRect().width));
    await page.viewport(402, 874);
    await expect.element(page.getByRole('button', { name: 'Pages' })).toBeVisible();
    await page.viewport(1440, 1000);
    await expect.poll(() => link()?.textContent).toBe('components');
    await expect.poll(() => underline()?.offsetWidth).toBe(Math.round(link().getBoundingClientRect().width));
  });
});
