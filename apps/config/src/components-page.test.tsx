import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { cleanup, renderApp } from './test-utils';

afterEach(cleanup);

const stage = (name: string) => document.querySelector(`[data-component-stage="${name}"]`)!;

// Each test loads the page and every story with it, which can take most of the default 15s when the whole suite runs.
describe('components page', { timeout: 45000 }, () => {
  test('shows every component live, with controls for its design props', async () => {
    renderApp();
    await page.getByRole('link', { name: 'components' }).click();
    await expect.element(page.getByRole('searchbox', { name: 'Find a component' })).toBeVisible();
    await expect.poll(() => document.querySelectorAll('[data-component-stage]').length, { timeout: 15000 }).toBeGreaterThan(30);
    // Button: its variant, size and tone, disabled, and its label.
    const controls = page.getByRole('group', { name: 'Button properties', exact: true });
    // Every set of values is a select.
    expect(controls.getByRole('radiogroup').query()).toBeNull();
    await expect.element(controls.getByRole('switch', { name: 'Disabled' })).toBeVisible();
    await controls.getByRole('textbox', { name: 'Content' }).fill('Delete project');
    await controls.getByRole('button', { name: /^default\s+Variant/ }).click();
    await page.getByRole('option', { name: 'outline' }).click();
    const button = () => stage('Button').querySelector('button')!;
    await expect.poll(() => button().textContent).toBe('Delete project');
    await expect.poll(() => getComputedStyle(stage('Button').querySelector('[data-themis-part="surface"]')!).backgroundColor).toBe('rgb(255, 255, 255)');
    await controls.getByText('Disabled', { exact: true }).click();
    await expect.poll(() => button().hasAttribute('disabled') || button().getAttribute('aria-disabled') === 'true').toBe(true);
  });

  test('components take the theme being edited, in sandboxes; the page keeps the tool’s style', async () => {
    renderApp();
    await page.getByRole('link', { name: 'components' }).click();
    await expect.poll(() => stage('Button')?.querySelector('[data-themis-part="surface"]'), { timeout: 15000 }).toBeTruthy();
    const fill = () => getComputedStyle(stage('Button').querySelector('[data-themis-part="surface"]')!).backgroundColor;
    expect(fill()).toBe('rgb(116, 6, 235)');
    // The theme's variables are set on each sandbox, not around the page: the cards and controls are the tool's.
    expect(stage('Button').closest('[data-themis][style]')).not.toBeNull();
    expect(document.querySelector('[aria-label="Button properties"]')!.closest('[data-themis][style]')).toBeNull();
    await page.getByRole('textbox', { name: /^Brand/ }).fill('#0B7A75');
    await userEvent.keyboard('{Tab}');
    await expect.poll(fill, { timeout: 5000 }).toBe('rgb(11, 122, 117)');
  });

  test('a modal opens from a button, and search narrows the list', async () => {
    renderApp();
    await page.getByRole('link', { name: 'components' }).click();
    await expect.poll(() => stage('Modal'), { timeout: 15000 }).toBeTruthy();
    expect(page.getByRole('dialog').query()).toBeNull();
    await page.getByRole('button', { name: 'Open modal' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Invite teammates' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await page.getByRole('searchbox', { name: 'Find a component' }).fill('color');
    await expect.poll(() => [...document.querySelectorAll('[data-component-stage]')].map((s) => s.getAttribute('data-component-stage'))).toEqual([
      'ColorArea',
      'ColorField',
      'ColorPicker',
      'ColorPickerSwatch',
      'ColorRangeSlider',
      'ColorSlider',
      'ColorSwatch',
    ]);
  });

  test('with room, an index beside the cards jumps to a component and follows the scroll', async () => {
    renderApp();
    await page.getByRole('link', { name: 'components' }).click();
    const index = page.getByRole('navigation', { name: 'On this page' });
    await expect.element(index).toBeVisible();
    // Grouped by category, in the index and on the page.
    await expect.element(page.getByRole('heading', { name: 'Actions', level: 2 })).toBeVisible();
    const current = () => document.querySelector('nav[aria-label="On this page"] [aria-current]')?.textContent;
    expect(current()).toBe('Button');
    // Regression: React Aria's hidden inputs were placed in the document, which scrolled on long past the last component.
    expect(document.scrollingElement!.scrollHeight).toBeLessThanOrEqual(window.innerHeight);
    await index.getByRole('button', { name: 'Tooltip' }).click();
    await expect.poll(current).toBe('Tooltip');
    // The card is at the top of the preview, and the window itself hasn't scrolled.
    const preview = document.querySelector('main')!.getBoundingClientRect().top;
    expect(Math.abs(document.getElementById('component-Tooltip')!.getBoundingClientRect().top - preview)).toBeLessThan(40);
    expect(document.scrollingElement!.scrollTop).toBe(0);
    document.querySelector('main')!.scrollTop = 0;
    await expect.poll(current).toBe('Button');
  });

  test('without room, a category select filters the list instead', async () => {
    await page.viewport(834, 1112);
    renderApp();
    await page.getByRole('link', { name: 'components' }).click();
    await expect.element(page.getByRole('searchbox', { name: 'Find a component' })).toBeVisible();
    expect(page.getByRole('navigation', { name: 'On this page' }).query()).toBeNull();
    await page.getByRole('button', { name: /All categories/ }).click();
    await page.getByRole('option', { name: 'Overlays' }).click();
    await expect.poll(() => [...document.querySelectorAll('[data-component-stage]')].map((s) => s.getAttribute('data-component-stage'))).toEqual([
      'ActionMenu',
      'Modal',
      'Tooltip',
    ]);
    await page.viewport(1440, 1000);
  });
});
