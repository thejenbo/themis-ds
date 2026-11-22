import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { cleanup, renderApp } from './test-utils';

afterEach(cleanup);

const stage = (name: string) => document.querySelector(`[data-component-stage="${name}"]`)!;

describe('components page', () => {
  test('shows every component live, with controls for its design props', async () => {
    renderApp();
    await page.getByRole('link', { name: 'components' }).click();
    await expect.element(page.getByRole('searchbox', { name: 'Find a component' })).toBeVisible();
    await expect.poll(() => document.querySelectorAll('[data-component-stage]').length, { timeout: 15000 }).toBeGreaterThan(30);
    // Button: its variant, size and tone, disabled, and its label.
    const controls = page.getByRole('group', { name: 'Button properties', exact: true });
    await expect.element(controls.getByRole('radiogroup', { name: 'Variant' })).toBeVisible();
    await expect.element(controls.getByRole('switch', { name: 'Disabled' })).toBeVisible();
    await controls.getByRole('textbox', { name: 'Content' }).fill('Delete project');
    await controls.getByRole('radio', { name: 'outline' }).click();
    const button = () => stage('Button').querySelector('button')!;
    await expect.poll(() => button().textContent).toBe('Delete project');
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
});
