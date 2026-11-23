import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { chooseMenuItem, cleanup, menuItem, nameField, renderApp, themeActions, themeNames, themeSelect } from './test-utils';

afterEach(cleanup);

describe('theme switcher', () => {
  test('lists every theme with its color dots, then a divider and "Add new theme"', async () => {
    renderApp();
    await themeSelect().click();
    await expect.element(page.getByRole('option', { name: 'light' })).toBeVisible();
    await expect.element(page.getByRole('option', { name: 'dark' })).toBeVisible();
    await expect.element(page.getByRole('separator')).toBeInTheDocument();
    await expect.element(page.getByRole('option', { name: 'Add new theme' })).toBeVisible();
    // Brand, background and text dots, before the name.
    const dots = page.getByRole('option', { name: 'dark' }).element().querySelectorAll('span[style*="background"]');
    expect([...dots].map((d) => getComputedStyle(d).backgroundColor)).toEqual(['rgb(235, 191, 248)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)']);
  });

  test('choosing a theme switches the sidebar and the preview', async () => {
    renderApp();
    await themeSelect().click();
    await page.getByRole('option', { name: 'dark' }).click();
    await expect.element(themeSelect()).toHaveTextContent('dark');
    await expect.element(page.getByRole('main', { name: 'Preview of the dark theme' })).toBeInTheDocument();
  });

  test('"Add new theme" in the list opens the name field and keeps the current theme selected', async () => {
    renderApp();
    await themeSelect().click();
    await page.getByRole('option', { name: 'Add new theme' }).click();
    await expect.element(nameField()).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(themeSelect()).toHaveTextContent('light');
    await expect.poll(themeNames).toEqual(['light', 'dark']);
  });
});

describe('naming a new theme', () => {
  test('starts from the light theme and creates it on Enter, then focuses the switcher', async () => {
    renderApp();
    await themeSelect().click();
    await page.getByRole('option', { name: 'dark' }).click();
    await chooseMenuItem('Add new theme');
    // The sidebar shows the new theme's starting values (the light theme's brand).
    await expect.element(page.getByRole('textbox', { name: /Brand/ })).toHaveValue('#7406EB');
    await userEvent.keyboard('high contrast{Enter}');
    await expect.poll(themeNames).toEqual(['light', 'dark', 'high contrast']);
    await expect.element(themeSelect()).toHaveTextContent('high contrast');
    await expect.element(themeSelect()).toHaveFocus();
  });

  test('an empty or taken name shows an error and puts focus back in the field', async () => {
    renderApp();
    await chooseMenuItem('Add new theme');
    await page.getByRole('button', { name: 'Create theme' }).click();
    await expect.element(page.getByText('Enter a name for the theme.')).toBeVisible();
    // Focus returns to the field, so typing fixes it straight away (it used to stay on ✓).
    await expect.element(nameField()).toHaveFocus();
    await userEvent.keyboard('dark{Enter}');
    await expect.element(page.getByText('There’s already a theme called “dark”.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(themeNames).toEqual(['light', 'dark']);
  });

  test('Escape cancels without asking when nothing changed', async () => {
    renderApp();
    await chooseMenuItem('Add new theme');
    await userEvent.keyboard('{Escape}');
    await expect.element(themeSelect()).toHaveFocus();
    expect(page.getByRole('alertdialog').query()).toBeNull();
  });

  test('✕ after changing a value asks before discarding', async () => {
    renderApp();
    await chooseMenuItem('Add new theme');
    const brand = page.getByRole('textbox', { name: /Brand/ });
    await brand.fill('#123456');
    await userEvent.keyboard('{Tab}');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect.element(page.getByRole('alertdialog', { name: 'Discard this theme?' })).toBeVisible();
    await page.getByRole('button', { name: 'Keep editing' }).click();
    await expect.element(brand).toHaveValue('#123456');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Discard' }).click();
    await expect.poll(themeNames).toEqual(['light', 'dark']);
    await expect.element(nameField()).not.toBeInTheDocument();
  });

  test('Export is off until the new theme is named', async () => {
    renderApp();
    await chooseMenuItem('Add new theme');
    await expect.element(page.getByRole('button', { name: 'Export' })).toBeDisabled();
    await userEvent.keyboard('sepia{Enter}');
    await expect.element(page.getByRole('button', { name: 'Export' })).toBeEnabled();
  });
});

describe('theme actions', () => {
  test('Duplicate prefills "<name> copy" with the same values', async () => {
    renderApp();
    await chooseMenuItem('Duplicate "light"');
    await expect.element(nameField()).toHaveValue('light copy');
    await userEvent.keyboard('{Enter}');
    await expect.poll(themeNames).toEqual(['light', 'dark', 'light copy']);
    await expect.element(page.getByRole('textbox', { name: /Brand/ })).toHaveValue('#7406EB');
  });

  test('Rename keeps the theme in its place and refuses a taken name', async () => {
    renderApp();
    await chooseMenuItem('Rename "light"');
    await expect.element(page.getByRole('textbox', { name: 'Theme name' })).toHaveValue('light');
    await page.getByRole('textbox', { name: 'Theme name' }).fill('dark');
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByText('There’s already a theme called “dark”.')).toBeVisible();
    await page.getByRole('textbox', { name: 'Theme name' }).fill('daylight');
    await userEvent.keyboard('{Enter}');
    await expect.poll(themeNames).toEqual(['daylight', 'dark']);
  });

  test('Delete asks first, then selects the neighboring theme; the last theme can’t be deleted', async () => {
    renderApp();
    await chooseMenuItem('Delete "light"');
    await expect.element(page.getByRole('alertdialog', { name: 'Delete the light theme?' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect.poll(themeNames).toEqual(['dark']);
    await expect.element(themeSelect()).toHaveTextContent('dark');
    await themeActions().click();
    await expect.element(menuItem('Delete "dark"')).toHaveAttribute('aria-disabled', 'true');
  });

  test('the actions name the theme; a long name is cut short inside the quotes, and the menu stays on screen', async () => {
    await page.viewport(375, 812);
    try {
      renderApp();
      await themeActions().click();
      const labels = page.getByRole('menuitem').elements().map((el) => el.textContent);
      expect(labels).toEqual(['Rename "light"', 'Duplicate "light"', 'Add new theme', 'Delete "light"', 'Reset all themes']);
      await userEvent.keyboard('{Escape}');

      const long = 'a really long theme name that will not fit in the menu';
      await chooseMenuItem('Rename "light"');
      await nameField().fill(long);
      await userEvent.keyboard('{Enter}');
      await themeActions().click();
      const item = menuItem(`Delete "${long}"`);
      await expect.element(item).toBeVisible();
      const spans = [...item.element().querySelectorAll('span')];
      const name = spans.find((s) => s.textContent === long)!;
      const close = name.nextElementSibling!;
      expect(name.previousElementSibling!.textContent).toBe('Delete "');
      expect(close.textContent).toBe('"');
      // The name is cut short (with an ellipsis), but the closing quote still shows inside the item.
      expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
      expect(getComputedStyle(name).textOverflow).toBe('ellipsis');
      const itemBox = item.element().getBoundingClientRect();
      expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(itemBox.right);
      const menu = item.element().closest('[role="menu"]')!.getBoundingClientRect();
      expect(menu.left).toBeGreaterThanOrEqual(0);
      expect(menu.right).toBeLessThanOrEqual(375);
    } finally {
      await page.viewport(1440, 1000);
    }
  });

  test('Reset all themes restores the starting themes after a confirm', async () => {
    renderApp();
    await chooseMenuItem('Duplicate "light"');
    await userEvent.keyboard('{Enter}');
    await chooseMenuItem('Reset all themes');
    await page.getByRole('alertdialog', { name: 'Reset all themes?' }).getByRole('button', { name: 'Reset all themes' }).click();
    await expect.poll(themeNames).toEqual(['light', 'dark']);
    await expect.element(themeSelect()).toHaveTextContent('light');
  });
});
